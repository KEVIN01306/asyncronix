import type { CrearFacturaData, FacturaEntity } from "../entities/factura.entity.js";

export interface FacturaRepository {
    crear(data: CrearFacturaData): Promise<FacturaEntity>;
    obtenerPorId(id: string): Promise<FacturaEntity | null>;
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
    
    // Datos agregados
    obtenerDatosParaFacturar(venta_id: string): Promise<any>;
    obtenerDatosParaFacturarServicio(servicio_id: string): Promise<any>;

    // Configuración
    obtenerConfiguracion(negocio_id: string): Promise<any | null>;
    obtenerConfiguracionConPais(negocio_id: string): Promise<any | null>;
    guardarTokenTemporal(negocio_id: string, token: string, expiraEn: Date): Promise<void>;
}
