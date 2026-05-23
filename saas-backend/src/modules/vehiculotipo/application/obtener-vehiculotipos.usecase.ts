import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import type { VehiculoTipoRepository } from "../domain/vehiculotipo.repository.js";

export class ObtenerVehiculoTiposUseCase {
    constructor(private readonly repository: VehiculoTipoRepository) { }

    async execute(page: number, perPage: number) {
        try {
            return await this.repository.listar({ page, perPage });
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
