import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { MonedaRepository } from "../../moneda/domain/moneda.repository.js";
import type { NegocioRepository } from "../domain/negocio.repository.js";

export class CambiarMonedaNegocioUseCase {
    constructor(
        private readonly negocioRepository: NegocioRepository,
        private readonly monedaRepository: MonedaRepository
    ) { }

    async execute(negocio_id: string, moneda_id: string) {
        try {
            const negocio = await this.negocioRepository.obtener(negocio_id);
            if (!negocio) throw new AppError('Negocio no encontrado', 'NOT_FOUND', 404);

            const moneda = await this.monedaRepository.obtener(moneda_id);
            if (!moneda) throw new AppError('Moneda no encontrada', 'NOT_FOUND', 404);

            return await this.negocioRepository.cambiarMoneda(negocio_id, moneda_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
