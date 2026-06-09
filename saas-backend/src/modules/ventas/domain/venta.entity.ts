import type { EstadoVenta, MetodoPago } from "@prisma/client";

export type { MetodoPago };

export interface VentaProductoInput {
    variante_id: string;
    cantidad: number;
}

export interface VentaCrear {
    sucursal_id: string;
    cliente_id?: string | null;
    metodo_pago: MetodoPago;
    estado: EstadoVenta;
    productos: VentaProductoInput[];
    // Campos opcionales que puede proporcionar el Use Case al persistir
    detalles?: any[];
    total?: number;
    total_costo?: number;
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
    variante_id?: string | null;
    lote_id: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    costo_unitario: number;
    subtotal: number;
}

export interface VentaClienteInfo {
    id: string;
    nombre: string;
    dpi?: string | null;
}

export interface VentaModeloInfo {
    id: string;
    modelo: string;
}

export interface VentaVehiculoInfo {
    id: string;
    placa: string;
    modelo?: VentaModeloInfo | null;
}

export interface VentaSimple {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id: string | null;
    total: number;
    total_costo: number;
    comentarios?: string | null;
    estado: EstadoVenta;
    metodo_pago: MetodoPago;
    created_at: Date;
    updated_at: Date;
    vendedor_nombre: string;
    cliente_nombre: string | undefined;
    cliente?: VentaClienteInfo | null;
    vehiculo?: VentaVehiculoInfo | null;
}

export interface VentaObtenerDetalle extends VentaSimple {
    detalles: VentaDetalleSimple[];
}
