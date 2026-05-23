import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ModeloRepository } from "../domain/modelo.repository.js";
import type { ModeloFilters } from "../domain/modelo.repository.js";

export class ObtenerModelosUseCase {
    constructor(private readonly modeloRepository: ModeloRepository) { }

    async execute(page: number, perPage: number, filters?: ModeloFilters) {
        try {
            return await this.modeloRepository.listar({ page, perPage, filters });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
