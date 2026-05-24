import type { TipoServicioActualizar, TipoServicioSimple } from "../domain/tipo-servicio.entity.js";
import type { TipoServicioRepository } from "../domain/tipo-servicio.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class ActualizarTipoServicioUseCase {
    constructor(private readonly repository: TipoServicioRepository) { }

    async execute(id: string, negocio_id: string, data: TipoServicioActualizar): Promise<TipoServicioSimple> {
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
