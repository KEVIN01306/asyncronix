import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository, ListarServiciosParams } from "../domain/servicio.repository.js";

export class ObtenerServiciosUseCase {
    constructor(private readonly repository: ServicioRepository) { }

    async execute(params: ListarServiciosParams) {
        try {
            return await this.repository.listar(params);
        } catch (error) {
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw error;
        }
    }
}
