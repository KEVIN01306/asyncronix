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
    instagram_id: string | null;
    facebook_id: string | null;
    activo: boolean;
    fecha_registro: string | null;
    created_at: string;
    updated_at: string;
}