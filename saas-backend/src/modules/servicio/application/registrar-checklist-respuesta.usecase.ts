import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ChecklistRespuestaSimple } from "../domain/servicio.entity.js";

export class RegistrarChecklistRespuestaUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(data: Omit<ChecklistRespuestaSimple, 'id' | 'created_at' | 'updated_at'>, negocio_id: string): Promise<ChecklistRespuestaSimple> {
        try {
            return await this.repository.registrarChecklistRespuesta(data, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
