import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { LineaRepository } from "../domain/linea.repository.js";

export class ObtenerLineaUseCase {
    constructor(private readonly lineaRepository: LineaRepository) { }

    async execute(id: string) {
        try {
            return await this.lineaRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
