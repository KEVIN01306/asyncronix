import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

export class AdministrarReparacionUseCase {
    constructor(private readonly repository: ServicioRepository) {}

    async obtenerActiva(servicio_id: string, negocio_id: string) {
        try {
            const reparacion = await this.repository.obtenerReparacionActiva(servicio_id, negocio_id);
            if (!reparacion) throw new AppError('Reparación activa no encontrada', 'NOT_FOUND', 404);
            return reparacion;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al obtener la reparación', 'DATABASE_ERROR', 500);
        }
    }

    async actualizar(reparacion_id: string, data: { total?: number, descripcion?: string }, negocio_id: string) {
        try {
            if (data.total !== undefined && data.total < 0) {
                throw new AppError('El total no puede ser negativo', 'BAD_REQUEST', 400);
            }
            
            return await this.repository.actualizarReparacion(reparacion_id, data, negocio_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error al actualizar la reparación', 'DATABASE_ERROR', 500);
        }
    }
}
