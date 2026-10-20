import type { CrearFacturaData, FacturaEntity } from "../entities/factura.entity.js";

export interface ListarFacturasFiltros {
    fecha_inicio: Date;
    fecha_fin: Date;
    page: number;
    limit: number;
    q?: string | undefined;
}

export interface ListarFacturasResultado {
    data: FacturaEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ResumenFiscalResultado {
    total_facturado: number;
    total_impuestos_estimados: number;
    cantidad_facturas: number;
    cantidad_anuladas: number;
    total_anulado: number;
    regimen_fiscal_actual: string;
}

export interface FacturaRepository {
    crear(data: CrearFacturaData): Promise<FacturaEntity>;
    obtenerPorId(id: string): Promise<FacturaEntity | null>;
    obtenerPorIdYNegocio(id: string, negocio_id: string): Promise<FacturaEntity | null>;
    obtenerPorVentaId(venta_id: string): Promise<FacturaEntity | null>;
    obtenerPorServicioId(servicio_id: string): Promise<FacturaEntity | null>;
    marcarComoCertificada(
        factura_id: string, 
        dte_uuid: string, 
        serie: string, 
        fecha_certificacion: Date,
        dte_sat_xml?: string,
        dle_sat_pdf?: string
    ): Promise<FacturaEntity>;
    marcarComoError(factura_id: string): Promise<FacturaEntity>;
    marcarComoAnulada(
        factura_id: string, 
        nuevo_xml_url: string, 
        motivo: string, 
        acuse_anulacion: string | null
    ): Promise<FacturaEntity>;
    
    // Consultas para listado y resumen
    listarEmitidas(negocio_id: string, filtros: ListarFacturasFiltros): Promise<ListarFacturasResultado>;
    obtenerResumenFiscal(negocio_id: string, fecha_inicio: Date, fecha_fin: Date): Promise<ResumenFiscalResultado>;

    // Datos agregados para emitir
    obtenerDatosParaFacturar(venta_id: string): Promise<any>;
    obtenerDatosParaFacturarServicio(servicio_id: string): Promise<any>;

    // Configuración
    obtenerConfiguracion(negocio_id: string): Promise<any | null>;
    obtenerConfiguracionConPais(negocio_id: string): Promise<any | null>;
    actualizarConfiguracion(negocio_id: string, data: any): Promise<any>;
    guardarTokenTemporal(negocio_id: string, token: string, expiraEn: Date): Promise<void>;
}
