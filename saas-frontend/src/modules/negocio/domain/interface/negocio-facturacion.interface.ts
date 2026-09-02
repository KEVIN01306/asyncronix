export interface NegocioFacturacionConfig {
    nit_emisor: string;
    nombre_emisor: string;
    nombre_comercial: string;
    afiliacion_iva: string;
    tipo_frase: number;
    codigo_escenario: number;
    correo_emisor: string;
    fel_username: string;
    fel_ambiente: string;
    activo?: boolean;
}
