import { DatabaseError } from "@shared/database/errors/DatabaseError.js";
import AppError from "@shared/errors/AppError.js";
import type { ServicioRepository } from "../domain/servicio.repository.js";
import type { ServicioCustodia } from "../domain/servicio.entity.js";

export class ActualizarCustodiaUseCase {
    constructor(private readonly repository: ServicioRepository) {}

    async execute(id: string, negocio_id: string, data: { descripcion?: string | null, total?: number }): Promise<ServicioCustodia> {
        try {
            const updated = await this.repository.actualizarCustodia(id, negocio_id, data);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof DatabaseError) throw new AppError('Error en DB', 'DATABASE_ERROR', 500);
            throw new AppError('Error al actualizar la custodia', 'INTERNAL_SERVER_ERROR', 500);
        }
    }
}
