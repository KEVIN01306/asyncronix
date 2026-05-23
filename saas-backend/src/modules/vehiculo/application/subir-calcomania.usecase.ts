import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import ManejadorArchivosUtils from "@shared/infrastructure/manejadorArchivos.utils.js";

export class SubirCalcomaniaVehiculoUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(id: string, negocio_id: string, nuevoUrl: string) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                await ManejadorArchivosUtils.eliminarArchivo(nuevoUrl);
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            if (veh.calcomania_url) {
                await ManejadorArchivosUtils.eliminarArchivo(veh.calcomania_url);
            }

            await this.repository.actualizarCalcomania(id, negocio_id, nuevoUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
