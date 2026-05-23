import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { CilindradaSimple } from "../domain/cilindrada.entity.js";
import type { CilindradaRepository } from "../domain/cilindrada.repository.js";

export class ObtenerCilindradaUseCase {
    constructor(private readonly cilindradaRepository: CilindradaRepository) { }

    async execute(id: string): Promise<CilindradaSimple | null> {
        try {
            return await this.cilindradaRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
