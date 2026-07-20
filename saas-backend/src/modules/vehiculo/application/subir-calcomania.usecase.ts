import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";

export class SubirCalcomaniaVehiculoUseCase {
    constructor(
        private readonly repository: VehiculoRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(id: string, negocio_id: string, calcomaniaFile: FileDTO) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            const path = `tenant_${negocio_id}/vehicles/veh_${id}`;
            let nuevoUrl: string;

            if (veh.calcomania_url && this.storageProvider.replaceFile) {
                nuevoUrl = await this.storageProvider.replaceFile(veh.calcomania_url, calcomaniaFile, path, 'calcomania');
            } else {
                if (veh.calcomania_url) await this.storageProvider.deleteFile(veh.calcomania_url);
                nuevoUrl = await this.storageProvider.uploadFile(calcomaniaFile, path, 'calcomania');
            }

            await this.repository.actualizarCalcomania(id, negocio_id, nuevoUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
