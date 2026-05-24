import type { ChecklistItemRepository } from "../domain/checklist-item.repository.js";

export class EliminarChecklistItemUseCase {
    constructor(private readonly repository: ChecklistItemRepository) { }

    async execute(id: string, negocio_id: string) {
        await this.repository.eliminar(id, negocio_id);
    }
}
