export interface Cliente {
    id: string;
    nombre: string;
    apellido: string | null;
    telefono: string;
    email: string | null;
    nit: string | null;
    dpi: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClienteCreateFormValues {
    nombre: string;
    apellido: string | null;
    telefono: string;
    email: string | null;
    nit: string | null;
    dpi: string | null;
}

export type ClienteUpdateFormValues = ClienteCreateFormValues;
