export interface NegocioFacturacionConfig {
    id: string;
    negocio_id: string;
    nit_emisor: string;
    nombre_emisor: string;
    nombre_comercial: string;
    afiliacion_iva: string;
    tipo_frase: number;
    codigo_escenario: number;
    correo_emisor: string;
    fel_username: string;
    fel_ambiente: string;
    activo: boolean;
}

export interface NegocioFacturacionConfigActualizar {
    nit_emisor: string;
    nombre_emisor: string;
    nombre_comercial: string;
    afiliacion_iva: string;
    tipo_frase: number;
    codigo_escenario: number;
    correo_emisor: string;
    fel_username: string;
    fel_ambiente: string;
}
