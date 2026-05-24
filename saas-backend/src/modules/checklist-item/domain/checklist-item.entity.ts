export interface ChecklistItem {
    id: string;
    negocio_id: string;
    nombre: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface ChecklistItemCrear extends Omit<ChecklistItem, "id" | "negocio_id" | "activo" | "created_at" | "updated_at"> { }

export interface ChecklistItemActualizar extends Partial<Omit<ChecklistItem, "id" | "negocio_id" | "created_at" | "updated_at">> { }

export interface ChecklistItemSimple extends Omit<ChecklistItem, "negocio_id"> { }
