import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { DivisionNivel2 } from "../domain/geografia.entity.js";
import type { GeografiaRepository } from "../domain/geografia.repository.js";

export class ObtenerMunicipiosUseCase {
    constructor(private readonly geografiaRepository: GeografiaRepository) {}

    async execute(departamento_id: string): Promise<DivisionNivel2[]> {
        try {
            return await this.geografiaRepository.obtenerMunicipiosPorDepartamento(departamento_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error de base de datos al obtener municipios', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
