import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";

export class ObtenerVehiculoUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(id: string, negocio_id: string) {
        try {
            const v = await this.repository.obtener(id, negocio_id);
            if (!v) throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            return v;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
