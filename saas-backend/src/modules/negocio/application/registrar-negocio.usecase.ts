import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { NegocioCrear, NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";
import ManejadorArchivosUtils from "../infrastructure/utils/manejadorArchivos.utils.js";

export class RegistrarNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(data: NegocioCrear, logo_url: string | null): Promise<NegocioObtenidoDetalle> {
        try {
            const negocioExistente = await this.negocioRepository.obtenerPorWaId(data.wa_id);

            if (negocioExistente) {
                if (logo_url) await ManejadorArchivosUtils.eliminarArchivo(logo_url);
                throw new AppError('El negocio ya existe', 'DATA_ALREADY_EXISTS', 409);
            }

            return await this.negocioRepository.registrar({
                ...data,
                logo_url
            });
        } catch (error) {
            if (logo_url && !(error instanceof AppError && error.code === 'DATA_ALREADY_EXISTS')) {
                await ManejadorArchivosUtils.eliminarArchivo(logo_url);
            }

            if (error instanceof AppError) throw error;

            if (error instanceof UniqueConstraintError) {
                throw new AppError('El identificador del negocio ya existe', 'DATA_ALREADY_EXISTS', 409)
            }

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
