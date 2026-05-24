import type { ChecklistItemActualizar, ChecklistItemCrear, ChecklistItemSimple } from "./checklist-item.entity.js";

export interface ChecklistItemRepository {
    listar(negocio_id: string, page: number, perPage: number): Promise<{ total: number; data: ChecklistItemSimple[] }>;
    obtener(id: string, negocio_id: string): Promise<ChecklistItemSimple>;
    registrar(data: ChecklistItemCrear, negocio_id: string): Promise<ChecklistItemSimple>;
    actualizar(id: string, negocio_id: string, data: ChecklistItemActualizar): Promise<ChecklistItemSimple>;
    eliminar(id: string, negocio_id: string): Promise<void>;
}
