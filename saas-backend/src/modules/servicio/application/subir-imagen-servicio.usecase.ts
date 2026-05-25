import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioDetalle } from "../domain/servicio.entity.js";

interface Params {
    servicio_id: string;
    url: string;
    negocio_id: string;
    descripcion?: string | null;
}

export class SubirImagenServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute({ servicio_id, url, negocio_id, descripcion }: Params): Promise<ServicioDetalle> {
        try {
            const servicio = await this.repository.registrarImagen(servicio_id, url, negocio_id, descripcion);
            if (!servicio) throw new AppError('Servicio no encontrado', 'DATA_NOT_FOUND', 404);
            return servicio;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
