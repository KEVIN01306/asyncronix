import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { VehiculoCrear } from "../domain/vehiculo.entity.js";

export class RegistrarVehiculoUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(data: VehiculoCrear, negocio_id: string) {
        try {
            return await this.repository.crear(data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
