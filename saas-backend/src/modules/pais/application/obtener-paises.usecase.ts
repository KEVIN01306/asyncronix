import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { PaisRepository } from "../domain/pais.repository.js";

export class ObtenerPaisesUseCase {
    constructor(private readonly paisRepository: PaisRepository) { }

    async execute(page: number, perPage: number, filters?: { q?: string }) {
        try {
            return await this.paisRepository.listar({ page, perPage, filters });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
