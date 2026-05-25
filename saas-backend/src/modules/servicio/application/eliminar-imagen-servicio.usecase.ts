import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

export class EliminarImagenServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(imagen_id: string, servicio_id: string, negocio_id: string): Promise<void> {
        try {
            const imagen = await this.repository.obtenerImagen(imagen_id);
            if (!imagen) throw new AppError('Imagen no encontrada', 'IMAGE_NOT_FOUND', 404);
            if (imagen.servicio_id !== servicio_id) throw new AppError('Imagen no pertenece al servicio', 'IMAGE_NOT_BELONG', 400);
            await this.repository.eliminarImagen(imagen_id, negocio_id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
