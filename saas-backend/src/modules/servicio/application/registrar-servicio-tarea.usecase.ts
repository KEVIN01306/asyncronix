import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioTarea } from "../domain/servicio.entity.js";

export class RegistrarServicioTareaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, data: { nombre: string }, negocio_id: string): Promise<ServicioTarea> {
        try {
            return await this.repository.crearTarea(servicio_id, data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
