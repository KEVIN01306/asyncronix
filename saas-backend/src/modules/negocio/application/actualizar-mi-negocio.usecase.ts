import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { NegocioActualizar, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import ManejadorArchivosUtils from "../infrastructure/utils/manejadorArchivos.utils.js";

export class ActualizarMiNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(negocio_id: string, data: NegocioActualizar, nuevoLogoUrl: string | null | undefined): Promise<NegocioObtenidoDetalle> {
        try {
            const negocioActual = await this.negocioRepository.obtener(negocio_id);

            if (!negocioActual) {
                if (nuevoLogoUrl) await ManejadorArchivosUtils.eliminarArchivo(nuevoLogoUrl);
                throw new AppError('No se encontró el negocio para actualizar', 'DATA_NOT_FOUND', 404);
            }

            if (nuevoLogoUrl) {
                if (negocioActual.logo_url) {
                    await ManejadorArchivosUtils.eliminarArchivo(negocioActual.logo_url);
                }
                data.logo_url = nuevoLogoUrl;
            }

            return await this.negocioRepository.actualizar(negocio_id, data);
        } catch (error) {
            if (nuevoLogoUrl) await ManejadorArchivosUtils.eliminarArchivo(nuevoLogoUrl);

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