import type { EstadoFactura, MetodoPago, TipoDTE } from "@prisma/client";

export interface FacturaEntity {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id?: string | null;
    venta_id?: string | null;
    servicio_id?: string | null;

    tipo_dte: TipoDTE;
    serie?: string | null;
    numero_factura: string;
    dte_uuid?: string | null;
    dte_sat_xml?: string | null;
    dle_sat_pdf?: string | null; // Based on schema (dle_sat_pdf or dte_sat_pdf?) Note: schema says dle_sat_pdf
    dte_certificador?: string | null;
    acuse_recibo_sat?: string | null;

    receptor_nit: string;
    receptor_nombre: string;
    receptor_direccion?: string | null;

    subtotal_sin_iva: number;
    descuento: number;
    iva: number;
    total: number;

    metodo_pago: MetodoPago;
    estado: EstadoFactura;
    
    fecha_emision: Date;
    fecha_certificacion?: Date | null;
}

export interface CrearFacturaData {
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id?: string | null;
    venta_id?: string | null;
    servicio_id?: string | null;

    tipo_dte: TipoDTE;
    numero_factura: string;
    
    receptor_nit: string;
    receptor_nombre: string;
    receptor_direccion?: string | null;

    subtotal_sin_iva: number;
    descuento: number;
    iva: number;
    total: number;

    metodo_pago: MetodoPago;
    estado: EstadoFactura;
}
