import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { NegocioObtenidoDetalle } from "../domain/negocio.entity.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";

export class ObtenerMiNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository
    ) { }

    async execute(negocio_id: string): Promise<NegocioObtenidoDetalle> {
        try {
            const negocio = await this.negocioRepository.obtener(negocio_id);

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