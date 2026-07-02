import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { CambioSiguienteServicio } from "../domain/servicio.entity.js";

export class ListarCambiosSiguienteServicioUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(servicio_id: string, negocio_id: string): Promise<CambioSiguienteServicio[]> {
        try {
            return await this.repository.listarCambiosSiguienteServicio(servicio_id, negocio_id);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
