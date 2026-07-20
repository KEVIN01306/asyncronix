import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";

export class SubirAvatarVehiculoUseCase {
    constructor(
        private readonly repository: VehiculoRepository,
        private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase
    ) { }

    async execute(id: string, negocio_id: string, avatarFile: FileDTO) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            const path = `tenant_${negocio_id}/vehicles/veh_${id}`;
            const nuevoAvatarUrl = await this.reemplazarMediaUseCase.execute(avatarFile, negocio_id, path, 'avatar', veh.avatar_url ?? undefined);

            await this.repository.actualizarAvatar(id, negocio_id, nuevoAvatarUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
