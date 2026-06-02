import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

export class ObtenerEstadoServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, negocio_id: string) {
        try {
            const servicio = await this.repository.obtenerEstado(id, negocio_id);
            if (!servicio) throw new AppError('Servicio no encontrado', 'DATA_NOT_FOUND', 404);
            return servicio;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
