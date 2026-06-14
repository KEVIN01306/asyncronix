import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository, VehiculoFilters } from "../domain/vehiculo.repository.js";

export class ObtenerVehiculosUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(negocio_id: string, page: number, perPage: number, filters?: VehiculoFilters) {
        try {
            return await this.repository.listar(negocio_id, { page, perPage }, filters);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
