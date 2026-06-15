import type { ChecklistItemRepository } from "../domain/checklist-item.repository.js";

export class ObtenerChecklistItemsUseCase {
    constructor(private readonly repository: ChecklistItemRepository) { }

    async execute(negocio_id: string, page: number, perPage: number, q?: string | null) {
        return this.repository.listar(negocio_id, page, perPage, q);
    }
}
