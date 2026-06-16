import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

interface Params {
    id: string;
    servicio_id: string;
    negocio_id: string;
    data: { nombre?: string; completado?: boolean; observacion?: string | null };
}

export class ActualizarServicioTareaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, servicio_id: string, negocio_id: string, data: Params['data']): Promise<void> {
        try {
            await this.repository.actualizarTarea(id, servicio_id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
