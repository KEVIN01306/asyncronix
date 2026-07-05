import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { MonedaRepository } from "../domain/moneda.repository.js";

export class ObtenerMonedaUseCase {
    constructor(private readonly monedaRepository: MonedaRepository) { }

    async execute(id: string) {
        try {
            return await this.monedaRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
