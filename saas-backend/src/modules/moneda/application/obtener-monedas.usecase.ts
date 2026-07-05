import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { MonedaRepository } from "../domain/moneda.repository.js";

export class ObtenerMonedasUseCase {
    constructor(private readonly monedaRepository: MonedaRepository) { }

    async execute(page: number, perPage: number, filters?: { q?: string }) {
        try {
            return await this.monedaRepository.listar({ page, perPage, filters });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
