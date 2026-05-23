import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { ModeloRepository } from "../domain/modelo.repository.js";

export class ObtenerModeloUseCase {
    constructor(private readonly modeloRepository: ModeloRepository) { }

    async execute(id: string) {
        try {
            return await this.modeloRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
