import type { PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export type EstadoTraslado = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';

export interface TrasladoDetalleLote {
    id: string;
    variante_id: string;
    proveedor_id: string;
    codigo_lote: string;
    cantidad_inicial: number;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
    fecha_ingreso: string;
    fecha_vencimiento?: string | null;
    activo: boolean;
    sucursal: {
        id: string;
        nombre: string;
    };
    variante?: {
        id: string;
        sku?: string;
        producto_id?: string;
        producto?: {
            id: string;
            nombre: string;
        };
    };
}

export interface TrasladoDetalleLinea {
    id: string;
    traslado_id: string;
    lote_id: string;
    cantidad: number;
    lote?: TrasladoDetalleLote;
}

export interface TrasladoSucursal {
    id: string;
    nombre: string;
}

export interface TrasladoCreador {
    id: string;
    nombre: string;
    apellido?: string | null;
}

export interface TrasladoDetalle {
    id: string;
    consecutivo: number;
    origen_id: string;
    destino_id: string;
    creador_id: string;
    estado: EstadoTraslado;
    created_at: string;
    updated_at: string;
    origen: TrasladoSucursal;
    destino: TrasladoSucursal;
    creador: TrasladoCreador;
    detalles: TrasladoDetalleLinea[];
}

export interface TrasladoDetalleCrear {
    lote_id: string;
    cantidad: number;
}

export interface TrasladoCrearForm {
    sucursal_destino_id: string;
    detalles: TrasladoDetalleCrear[];
}

export type TrasladoResponse = PaginatedResponse<TrasladoDetalle>;
