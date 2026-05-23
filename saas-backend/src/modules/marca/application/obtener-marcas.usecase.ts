import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { MarcaRepository } from "../domain/marca.repository.js";

export class ObtenerMarcasUseCase {
    constructor(private readonly marcaRepository: MarcaRepository) { }

    async execute(page: number, perPage: number) {
        try {
            return await this.marcaRepository.listar({ page, perPage });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
