export interface NegocioAsociado {
    id: string;
    nombre: string;
    nombre_comercial?: string | null;
}

export interface Cliente {
    id: string;
    nombre: string;
    apellido: string | null;
    telefono: string | null;
    email: string | null;
    nit: string | null;
    dpi: string | null;
    created_at: string;
    updated_at: string;
    negocios?: NegocioAsociado[];
    reutilizado?: boolean;
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

export interface ClienteDetalle extends Cliente {
    conteo_relaciones?: ConteoRelacionesCliente;
}

export interface ClienteCreateFormValues {
    nombre: string;
    apellido?: string | null;
    telefono?: string | null;
    email?: string | null;
    nit?: string | null;
    dpi?: string | null;
}

export type ClienteUpdateFormValues = ClienteCreateFormValues;

export interface ResumenUnificacion {
    origen: ClienteDetalle;
    destino: ClienteDetalle;
    relaciones_a_migrar: ConteoRelacionesCliente;
}

export interface UnificarClientesPayload {
    cliente_conservar_id: string;
    cliente_eliminar_id: string;
    adoptar_datos_faltantes?: boolean;
    datos_fusionados?: {
        nombre?: string;
        apellido?: string | null;
        telefono?: string | null;
        email?: string | null;
        nit?: string | null;
        dpi?: string | null;
    };
}
