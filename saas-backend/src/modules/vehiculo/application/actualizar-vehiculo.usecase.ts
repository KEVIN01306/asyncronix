import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { VehiculoActualizar } from "../domain/vehiculo.entity.js";

export class ActualizarVehiculoUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(id: string, negocio_id: string, data: VehiculoActualizar) {
        try {
            return await this.repository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
