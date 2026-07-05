export interface Negocio {
    id: string;
    nombre: string;
    slug: string;
    nombre_comercial: string | null;
    wa_id: string;
    nit_rut: string | null;
    logo_url: string | null;
    slogan: string | null;
    datos_facturacion_json: any | null;
    pais_id: string | null;
    moneda_id: string | null;
    instagram_id: string | null;
    facebook_id: string | null;
    activo: boolean;
    fecha_registro: string | null;
    created_at: string;
    updated_at: string;
    pais?: {
        id: string;
        codigo_iso: string;
        nombre: string;
        codigo_tel: string;
        moneda_id: string;
        locale?: string | null;
        activo: boolean;
        created_at: string;
        updated_at: string;
    } | null;
    moneda?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
        activo: boolean;
        created_at: string;
        updated_at: string;
    } | null;
}