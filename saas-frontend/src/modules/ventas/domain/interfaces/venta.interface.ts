import type { PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export type EstadoVenta = 'PENDIENTE' | 'COMPLETADA' | 'ANULADA';
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'OTRO';

export interface VentaDetalleSimple {
    id: string;
    lote_id: string | null;
    variante_id?: string | null;
    producto_id?: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    costo_unitario: number;
    subtotal: number;
}

export interface VentaVarianteDetalle {
    id: string;
    producto_id: string;
    sku: string;
    codigo_barras?: string | null;
    correlativo?: string | null;
    qr_codigo?: string | null;
    precio_sugerido: number;
    stock_total: number;
    activo: boolean;
    producto?: {
        id: string;
        nombre: string;
    };
    valores?: Array<{
        id: string;
        valor: string;
        atributo?: {
            id: string;
            nombre: string;
        };
    }>;
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

export interface PreVentaDetalle {
    id: string;
    variante_id: string;
    descripcion: string;
    cantidad: number;
    precio: number;
}

export interface PreVenta {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    cliente_id: string | null;
    activo: boolean;
    created_at: string;
    updated_at: string;
    detalles: PreVentaDetalle[];
}

export interface PreVentaCreateForm {
    sucursal_id: string;
    cliente_id: string | null;
    items: Array<{
        variante_id: string;
        cantidad: number;
        precio?: number;
        descripcion?: string;
    }>;
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
