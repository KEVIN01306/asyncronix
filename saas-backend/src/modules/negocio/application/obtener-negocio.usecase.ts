import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";

export class ObtenerNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(id: string, query_negocio_id: string): Promise<NegocioObtenidoDetalle> {
        if (id !== query_negocio_id) {
            throw new AppError('No tienes permiso para acceder a este negocio', 'DATA_NOT_FOUND', 404);
        }

        try {
            const negocio = await this.negocioRepository.obtener(id);

            if (!negocio) {
                throw new AppError('No se encontró el negocio', 'DATA_NOT_FOUND', 404);
            }

            return negocio;
        } catch (error) {
            if (error instanceof AppError) throw error;

            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500)
            }

            throw error
        }
    }
}
