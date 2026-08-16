import type { EstadoCotizacion, TipoDestinoCotizacion } from "@prisma/client";

export interface CotizacionSimple {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id: string | null;
    vehiculo_id: string | null;
    correlativo: number;
    codigo: string;
    total: number;
    fecha_emision: Date;
    fecha_validez: Date;
    estado: EstadoCotizacion;
    tipo_destino: TipoDestinoCotizacion;
    terminos: string | null;
    venta_id: string | null;
    servicio_id: string | null;
    created_at: Date;
    updated_at: Date;

    // Relaciones básicas
    cliente?: {
        id: string;
        nombre: string;
        telefono: string;
        email?: string | null;
    } | null;
    vehiculo?: {
        id: string;
        placa: string;
    } | null;
    usuario?: {
        id: string;
        nombre: string;
        apellido: string | null;
    };
}

export interface CotizacionDetalle {
    id: string;
    cotizacion_id: string;
    variante_id: string | null;
    tipo_servicio_id: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
}

export interface CotizacionCompleta extends CotizacionSimple {
    detalles: CotizacionDetalle[];
}

export interface CotizacionDetalleCrear {
    variante_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
}

export interface CotizacionCrear {
    cliente_id?: string | null;
    vehiculo_id?: string | null;
    fecha_validez?: Date; // Por defecto serán 15 días si no se envía
    tipo_destino: TipoDestinoCotizacion;
    terminos?: string | null;
    detalles: CotizacionDetalleCrear[];
}

export interface CotizacionActualizarEstado {
    estado: EstadoCotizacion;
}
