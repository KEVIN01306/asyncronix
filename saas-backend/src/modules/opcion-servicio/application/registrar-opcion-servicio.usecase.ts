import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { OpcionServicioCrear, OpcionServicioSimple } from "../domain/opcion-servicio.entity.js";
import type { OpcionServicioRepository } from "../domain/opcion-servicio.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class RegistrarOpcionServicioUseCase {
    constructor(private readonly repository: OpcionServicioRepository) { }

    async execute(data: OpcionServicioCrear, negocio_id: string): Promise<OpcionServicioSimple> {
        try {
            return await this.repository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('La opción de servicio ya existe', 'DATA_ALREADY_EXISTS', 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
