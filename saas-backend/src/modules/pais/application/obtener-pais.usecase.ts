import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { PaisRepository } from "../domain/pais.repository.js";

export class ObtenerPaisUseCase {
    constructor(private readonly paisRepository: PaisRepository) { }

    async execute(id: string) {
        try {
            return await this.paisRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
