import type { PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'TRANSFERENCIA' | 'OTROS';

export interface VentaDetalleSimple {
    id: string;
    lote_id: string | null;
    producto_id?: string | null;
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

export interface Venta {
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
    created_at: string;
    updated_at: string;
    vendedor_nombre: string;
    cliente_nombre?: string;
    cliente?: VentaClienteInfo | null;
    vehiculo?: VentaVehiculoInfo | null;
    detalles: VentaDetalleSimple[];
}

export interface VentaProductoInput {
    producto_id: string;
    cantidad: number;
    nombre?: string;
    precio_sugerido?: number;
    subtotal?: number;
}

export interface VentaCreateForm {
    sucursal_id: string;
    cliente_id: string | null;
    metodo_pago: MetodoPago;
    estado: EstadoVenta;
    productos: VentaProductoInput[];
}

export interface VentaUpdateForm {
    sucursal_id: string;
    cliente_id?: string | null;
    metodo_pago?: MetodoPago;
    estado?: EstadoVenta;
    productos?: VentaProductoInput[];
}

export type VentaForm = VentaCreateForm | VentaUpdateForm;

export type VentaResponse = PaginatedResponse<Venta>;
