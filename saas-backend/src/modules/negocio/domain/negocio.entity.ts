export interface Negocio {
    id: string;
    nombre_comercial: string;
    wa_id: string;
    nit_rut: string | null;
    logo_url: string | null;
    slogan: string | null;
    datos_facturacion_json: any | null;
    fecha_registro: Date;
}

export interface NegocioSimple {
    id: string;
    nombre_comercial: string;
    logo_url: string | null;
}

export interface NegocioObtenidoDetalle extends Negocio { }

export interface NegocioCrear extends Omit<Negocio, "id" | "fecha_registro" | "logo_url"> { }

export interface NegocioActualizar extends Partial<NegocioCrear> {
    logo_url?: string | null;
}
