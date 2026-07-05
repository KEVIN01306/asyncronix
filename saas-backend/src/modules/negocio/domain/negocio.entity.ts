export interface Negocio {
    id: string;
    nombre_comercial: string;
    nombre: string;
    wa_id: string;
    nit_rut: string | null;
    logo_url: string | null;
    slogan: string | null;
    slug: string;
    datos_facturacion_json: any | null;
    pais_id: string | null;
    moneda_id: string | null;
    instagram_id: string | null;
    facebook_id: string | null;
    activo: boolean;
    fecha_registro: Date | null;
    created_at: Date;
    updated_at: Date;
    pais?: {
        id: string;
        codigo_iso: string;
        nombre: string;
        codigo_tel: string;
        moneda_id: string;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
    } | null;
    moneda?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
        activo: boolean;
        created_at: Date;
        updated_at: Date;
    } | null;
}

export interface NegocioSimple {
    id: string;
    nombre_comercial: string;
    logo_url: string | null;
}

export interface NegocioObtenidoDetalle extends Negocio { }

export interface NegocioCrear extends Omit<Negocio, "id" | "fecha_registro" | "logo_url" | "activo"> { }

export interface NegocioActualizar extends Partial<NegocioCrear> {
    logo_url?: string | null;
}
