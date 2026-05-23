import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import ManejadorArchivosUtils from "@shared/infrastructure/manejadorArchivos.utils.js";

export class SubirAvatarVehiculoUseCase {
    constructor(private readonly repository: VehiculoRepository) { }

    async execute(id: string, negocio_id: string, nuevoAvatarUrl: string) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                // cleanup file already uploaded
                await ManejadorArchivosUtils.eliminarArchivo(nuevoAvatarUrl);
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            if (veh.avatar_url) {
                await ManejadorArchivosUtils.eliminarArchivo(veh.avatar_url);
            }

            await this.repository.actualizarAvatar(id, negocio_id, nuevoAvatarUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
