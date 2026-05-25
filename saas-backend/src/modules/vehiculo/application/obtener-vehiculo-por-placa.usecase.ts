import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";

export class ObtenerVehiculoPorPlacaUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(placa: string, negocio_id: string) {
        try {
            const vehiculo = await this.repository.obtenerPorPlaca(placa, negocio_id);
            if (!vehiculo) throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            return vehiculo;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
