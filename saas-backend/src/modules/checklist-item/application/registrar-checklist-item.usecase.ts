import { UniqueConstraintError } from "@shared/database/errors/UniqueConstraintError.js";
import type { ChecklistItemCrear, ChecklistItemSimple } from "../domain/checklist-item.entity.js";
import type { ChecklistItemRepository } from "../domain/checklist-item.repository.js";
import AppError from "@shared/errors/AppError.js";
import { DatabaseError } from "@shared/database/errors/DatabaseError.js";

export class RegistrarChecklistItemUseCase {
    constructor(private readonly repository: ChecklistItemRepository) { }

    async execute(data: ChecklistItemCrear, negocio_id: string): Promise<ChecklistItemSimple> {
        try {
            return await this.repository.registrar(data, negocio_id);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                throw new AppError('El checklist item ya existe', 'DATA_ALREADY_EXISTS', 409);
            }
            if (error instanceof DatabaseError) {
                throw new AppError('Error en la base de datos', 'DATABASE_ERROR', 500);
            }
            throw error;
        }
    }
}
