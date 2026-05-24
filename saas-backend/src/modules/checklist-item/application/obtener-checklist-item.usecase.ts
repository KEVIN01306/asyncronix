import type { ChecklistItemRepository } from "../domain/checklist-item.repository.js";

export class ObtenerChecklistItemUseCase {
    constructor(private readonly repository: ChecklistItemRepository) { }

    async execute(id: string, negocio_id: string) {
        return this.repository.obtener(id, negocio_id);
    }
}
