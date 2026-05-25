import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ChecklistRespuestaSimple } from "../domain/servicio.entity.js";

export class ActualizarChecklistRespuestaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(id: string, servicio_id: string, negocio_id: string, data: Partial<Omit<ChecklistRespuestaSimple, 'id' | 'servicio_id' | 'created_at' | 'updated_at'>>): Promise<ChecklistRespuestaSimple> {
        try {
            return await this.repository.actualizarChecklistRespuesta(id, servicio_id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
