import AppError from "@shared/errors/AppError.js";
import type { LoteDetalle } from "../domain/lote.entity.js";
import type { LoteRepository } from "../domain/lote.repository.js";
import { NotFoundPersistenceError } from "@shared/database/errors/NotFoundPersistenceError.js";

export class ObtenerLoteUseCase {
    constructor(private readonly repository: LoteRepository) { }

    async execute(id: string, negocio_id: string): Promise<LoteDetalle> {
        try {
            const found = await this.repository.obtener(id, negocio_id);
            if (!found) throw new AppError('Lote no encontrado', 'NOT_FOUND', 404);
            return found;
        } catch (error) {
            if (error instanceof NotFoundPersistenceError) {
                throw new AppError('Lote no encontrado', 'NOT_FOUND', 404);
            }
            throw error;
        }
    }
}
