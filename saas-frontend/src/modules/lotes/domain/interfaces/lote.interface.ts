import type { PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';

export interface Lote {
    id: string;
    variante_id: string;
    negocio_id: string;
    sucursal_id: string;
    proveedor_id: string;
    codigo_lote: string;
    cantidad_inicial: number;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
    fecha_ingreso: string;
    fecha_vencimiento?: string | null;
    activo: boolean;
    variante?: {
        id: string;
        sku?: string;
        producto_id?: string;
        producto_nombre?: string;
    };
    sucursal: {
        id: string;
        nombre: string;
    };
}

export type LotesResponse = PaginatedResponse<Lote>;
