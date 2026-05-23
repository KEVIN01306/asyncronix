import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { MarcaRepository } from "../domain/marca.repository.js";

export class ObtenerMarcaUseCase {
    constructor(private readonly marcaRepository: MarcaRepository) { }

    async execute(id: string) {
        try {
            return await this.marcaRepository.obtener(id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
