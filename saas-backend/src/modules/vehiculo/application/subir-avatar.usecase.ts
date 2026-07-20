import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { IStorageProvider, FileDTO } from "@shared/domain/providers/storage.provider.js";

export class SubirAvatarVehiculoUseCase {
    constructor(
        private readonly repository: VehiculoRepository,
        private readonly storageProvider: IStorageProvider
    ) { }

    async execute(id: string, negocio_id: string, avatarFile: FileDTO) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            const path = `tenant_${negocio_id}/vehicles/veh_${id}`;
            let nuevoAvatarUrl: string;

            if (veh.avatar_url && this.storageProvider.replaceFile) {
                nuevoAvatarUrl = await this.storageProvider.replaceFile(veh.avatar_url, avatarFile, path, 'avatar');
            } else {
                if (veh.avatar_url) await this.storageProvider.deleteFile(veh.avatar_url);
                nuevoAvatarUrl = await this.storageProvider.uploadFile(avatarFile, path, 'avatar');
            }

            await this.repository.actualizarAvatar(id, negocio_id, nuevoAvatarUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
