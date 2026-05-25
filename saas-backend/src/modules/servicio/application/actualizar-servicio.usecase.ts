import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioActualizar, ServicioDetalle } from "../domain/servicio.entity.js";

export class ActualizarServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, negocio_id: string, data: ServicioActualizar): Promise<ServicioDetalle> {
        try {
            return await this.repository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
