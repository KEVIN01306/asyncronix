import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";

export class ListarChecklistRespuestasUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, negocio_id: string) {
        try {
            return await this.repository.listarChecklistRespuestas(servicio_id, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
