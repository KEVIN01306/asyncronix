import type { EstadoVenta, MetodoPago } from "@prisma/client";

export interface VentaProductoInput {
    producto_id: string;
    cantidad: number;
}

export interface VentaCrear {
    sucursal_id: string;
    cliente_id?: string | null;
    metodo_pago: MetodoPago;
    estado: EstadoVenta;
    productos: VentaProductoInput[];
}

export interface VentaActualizar {
    sucursal_id: string;
    cliente_id?: string | null;
    metodo_pago?: MetodoPago;
    estado?: EstadoVenta;
    productos?: VentaProductoInput[];
}

export interface VentaDetalleSimple {
    id: string;
    producto_id?: string | null;
    lote_id: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    costo_unitario: number;
    subtotal: number;
}

export interface VentaSimple {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id: string | null;
    total: number;
    total_costo: number;
    estado: EstadoVenta;
    metodo_pago: MetodoPago;
    created_at: Date;
    updated_at: Date;
    vendedor_nombre: string;
    cliente_nombre: string | undefined;
}

export interface VentaObtenerDetalle extends VentaSimple {
    detalles: VentaDetalleSimple[];
}
