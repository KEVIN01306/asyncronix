export interface FacturaEmitida {
    id: string;
    dte_uuid: string | null;
    serie: string | null;
    numero_factura: string;
    tipo_dte: string;
    fecha_emision: string;
    fecha_certificacion?: string | null;
    total: number;
    total_impuestos: number;
    subtotal_sin_iva: number;
    porcentaje_impuesto: number;
    emisor_afiliacion_iva: string;
    receptor_nit: string;
    receptor_nombre: string;
    estado: 'EMITIDA' | 'CERTIFICADA' | 'ANULADA' | 'ERROR';
    tiene_xml: boolean;
    tiene_pdf: boolean;
}

export interface ListarFacturasFiltrosParams {
    periodo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
    limit?: number;
    q?: string;
}

export interface ListarFacturasResponse {
    data: FacturaEmitida[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    rango: {
        fecha_inicio: string;
        fecha_fin: string;
        periodo: string;
    };
}

export interface ResumenFiscalData {
    total_facturado: number;
    total_impuestos_estimados: number;
    cantidad_facturas: number;
    cantidad_anuladas: number;
    total_anulado: number;
    regimen_fiscal_actual: string;
    periodo: string;
    rango: {
        fecha_inicio: string;
        fecha_fin: string;
    };
}

export interface FacturacionConfigData {
    id: string;
    negocio_id: string;
    nit_emisor: string;
    nombre_emisor: string;
    nombre_comercial: string;
    afiliacion_iva: 'GEN' | 'PEQ';
    tipo_frase: number;
    codigo_escenario: number;
    correo_emisor: string;
    fel_username: string;
    fel_ambiente: 'PRUEBAS' | 'TEST' | 'PRODUCCION';
    activo: boolean;
    has_password?: boolean;
}
