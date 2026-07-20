import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { NegocioActualizar, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";

export class ActualizarNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository,
        private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase
    ) { }

    async execute(id: string, data: NegocioActualizar, logoFile: FileDTO | null | undefined, query_negocio_id: string): Promise<NegocioObtenidoDetalle> {

        if (id !== query_negocio_id) {
            throw new AppError('No tienes permiso para acceder a este negocio', 'DATA_NOT_FOUND', 404);
        }

        try {
            const negocioActual = await this.negocioRepository.obtener(id);

            if (!negocioActual) {
                throw new AppError('No se encontró el negocio para actualizar', 'DATA_NOT_FOUND', 404);
            }

            if (logoFile) {
                const path = `tenant_${id}/business/bus_${id}`;
                data.logo_url = await this.reemplazarMediaUseCase.execute(logoFile, id, path, 'logo', negocioActual.logo_url ?? undefined);
            }

            if (data.nombre_comercial) {
                data.slug = data?.nombre_comercial?.toLowerCase().replace(/\s+/g, '-');
            }

            return await this.negocioRepository.actualizar(id, data);
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('No se encontró el negocio para actualizar', 'DATA_NOT_FOUND', 404)
            }

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El identificador del negocio ya está en uso', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
