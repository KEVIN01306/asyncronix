import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioCrear, ServicioDetalle } from "../domain/servicio.entity.js";

export class RegistrarServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(data: ServicioCrear, negocio_id: string, recepcionista_id: string, options?: { tx?: any }): Promise<ServicioDetalle> {
        try {
            return await this.repository.registrar(data, negocio_id, recepcionista_id, options);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
