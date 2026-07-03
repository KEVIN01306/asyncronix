import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { CilindradaSimple } from "../domain/cilindrada.entity.js";
import type { CilindradaRepository } from "../domain/cilindrada.repository.js";

export class ObtenerCilindradasUseCase {
    constructor(private readonly cilindradaRepository: CilindradaRepository) { }

    async execute(page: number, perPage: number, filters?: { q?: string }): Promise<{ total: number; data: CilindradaSimple[]; page: number; perPage: number }> {
        try {
            return await this.cilindradaRepository.listar({ page, perPage, filters });
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
