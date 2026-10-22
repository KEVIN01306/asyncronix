export interface Cliente {
    id: string;
    nombre: string;
    apellido: string | null;
    telefono: string | null;
    email: string | null;
    password_hash: string | null;
    nit: string | null;
    dpi: string | null;
    created_at: Date;
    updated_at: Date;
    negocios?: Array<{
        id: string;
        nombre: string;
        nombre_comercial?: string | null | undefined;
    }> | undefined;
}

export interface ConteoRelacionesCliente {
    vehiculos: number;
    citas: number;
    servicios: number;
    ventas: number;
    pre_ventas: number;
    cotizaciones: number;
    facturas: number;
    sessions: number;
}

export interface ClienteObtenidoDetalle extends Cliente {
    conteo_relaciones?: ConteoRelacionesCliente | undefined;
    reutilizado?: boolean | undefined;
}

export interface ClienteSimple extends Pick<Cliente, "id" | "nombre" | "apellido" | "telefono" | "email" | "nit" | "dpi"> {
    negocios?: Array<{ id: string; nombre: string; nombre_comercial?: string | null | undefined }> | undefined;
}

export interface ClienteCrear {
    nombre: string;
    apellido?: string | null;
    telefono?: string | null;
    email?: string | null;
    nit?: string | null;
    dpi?: string | null;
    password?: string | null;
    password_hash?: string | null;
}

export interface ClienteActualizar extends Partial<ClienteCrear> { }

export interface ResumenUnificacion {
    origen: ClienteObtenidoDetalle;
    destino: ClienteObtenidoDetalle;
    relaciones_a_migrar: ConteoRelacionesCliente;
}
