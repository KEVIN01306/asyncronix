import type { ChecklistItemActualizar, ChecklistItemSimple } from "../domain/checklist-item.entity.js";
import type { ChecklistItemRepository } from "../domain/checklist-item.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class ActualizarChecklistItemUseCase {
    constructor(private readonly repository: ChecklistItemRepository) { }

    async execute(id: string, negocio_id: string, data: ChecklistItemActualizar): Promise<ChecklistItemSimple> {
        try {
            return await this.repository.actualizar(id, negocio_id, data);
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
