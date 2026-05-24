import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { TipoServicioCrear, TipoServicioSimple } from "../domain/tipo-servicio.entity.js";
import type { TipoServicioRepository } from "../domain/tipo-servicio.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class RegistrarTipoServicioUseCase {
    constructor(private readonly repository: TipoServicioRepository) { }

    async execute(data: TipoServicioCrear, negocio_id: string): Promise<TipoServicioSimple> {
        try {
            return await this.repository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El tipo de servicio ya existe', 'DATA_ALREADY_EXISTS', 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
