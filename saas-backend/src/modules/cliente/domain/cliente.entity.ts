export interface Cliente {
    id: string;
    negocio_id: string;
    nombre: string;
    apellido: string | null;
    telefono: string;
    email: string | null;
    nit: string | null;
    dpi: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ClienteObtenidoDetalle extends Omit<Cliente, "negocio_id"> { }

export interface ClienteSimple extends Pick<Cliente, "id" | "nombre" | "telefono" | "email" | "nit" | "dpi"> { }

export interface ClienteCrear extends Omit<Cliente, "id" | "created_at" | "updated_at" | "negocio_id"> { }

export interface ClienteActualizar extends Partial<ClienteCrear> { }
