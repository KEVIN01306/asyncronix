import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { DivisionNivel1 } from "../domain/geografia.entity.js";
import type { GeografiaRepository } from "../domain/geografia.repository.js";

export class ObtenerDepartamentosUseCase {
    constructor(private readonly geografiaRepository: GeografiaRepository) {}

    async execute(pais_id: string): Promise<DivisionNivel1[]> {
        try {
            return await this.geografiaRepository.obtenerDepartamentosPorPais(pais_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error de base de datos al obtener departamentos', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
