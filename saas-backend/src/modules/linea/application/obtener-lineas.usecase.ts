import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { LineaRepository } from "../domain/linea.repository.js";

export class ObtenerLineasUseCase {
    constructor(private readonly lineaRepository: LineaRepository) { }

    async execute(page: number, perPage: number) {
        try {
            return await this.lineaRepository.listar({ page, perPage });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
