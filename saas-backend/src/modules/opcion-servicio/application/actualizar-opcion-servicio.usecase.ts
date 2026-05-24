import type { OpcionServicioActualizar, OpcionServicioSimple } from "../domain/opcion-servicio.entity.js";
import type { OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class ActualizarOpcionServicioUseCase {
    constructor(private readonly repository: OpcionServicioRepository) { }

    async execute(id: string, negocio_id: string, data: OpcionServicioActualizar): Promise<OpcionServicioSimple> {
        try {
            return await this.repository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
