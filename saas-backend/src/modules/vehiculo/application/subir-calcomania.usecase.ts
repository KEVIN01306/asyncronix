import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { VehiculoRepository } from "../domain/vehiculo.repository.js";
import type { FileDTO } from "@shared/domain/providers/storage.provider.js";
import type { ReemplazarMediaUseCase } from "../../media/application/reemplazar-media.usecase.js";

export class SubirCalcomaniaVehiculoUseCase {
    constructor(
        private readonly repository: VehiculoRepository,
        private readonly reemplazarMediaUseCase: ReemplazarMediaUseCase
    ) { }

    async execute(id: string, negocio_id: string, calcomaniaFile: FileDTO) {
        try {
            const veh = await this.repository.obtener(id, negocio_id);
            if (!veh) {
                throw new AppError('Vehículo no encontrado', 'DATA_NOT_FOUND', 404);
            }

            const path = `tenant_${negocio_id}/vehicles/veh_${id}`;
            const nuevoCalcomaniaUrl = await this.reemplazarMediaUseCase.execute(calcomaniaFile, negocio_id, path, 'calcomania', veh.calcomania_url ?? undefined);

            await this.repository.actualizarCalcomania(id, negocio_id, nuevoCalcomaniaUrl);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
