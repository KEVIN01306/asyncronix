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
    dle_sat_pdf?: string | null;
    dte_certificador?: string | null;
    acuse_recibo_sat?: string | null;

    receptor_nit: string;
    receptor_nombre: string;
    receptor_direccion?: string | null;

    emisor_afiliacion_iva: string;
    subtotal_sin_iva: number | any;
    descuento: number | any;
    porcentaje_impuesto: number | any;
    total_impuestos: number | any;
    total: number | any;

    metodo_pago: MetodoPago;
    estado: EstadoFactura;
    motivo_anulacion?: string | null;
    acuse_anulacion?: string | null;
    
    fecha_emision: Date;
    fecha_certificacion?: Date | null;
    fecha_anulacion?: Date | null;
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

    emisor_afiliacion_iva: string;
    subtotal_sin_iva: number | any;
    descuento: number | any;
    porcentaje_impuesto: number | any;
    total_impuestos: number | any;
    total: number | any;

    metodo_pago: MetodoPago;
    estado: EstadoFactura;
}
