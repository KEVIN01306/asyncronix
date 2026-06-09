export interface Proveedor {
    id: string;
    nombre: string;
    contacto: string | null;
    telefono: string;
    email: string | null;
    nit: string | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProveedorCreateFormValues {
    nombre: string;
    contacto?: string | null;
    telefono: string;
    email?: string | null;
    nit?: string | null;
}

export type ProveedorUpdateFormValues = ProveedorCreateFormValues;
