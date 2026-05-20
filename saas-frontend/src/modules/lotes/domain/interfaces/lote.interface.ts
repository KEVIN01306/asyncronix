import type { PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';

export interface Lote {
    id: string;
    producto_id: string;
    negocio_id: string;
    sucursal_id: string;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
    fecha_ingreso: string;
    activo: boolean;
    producto: {
        id: string;
        nombre: string;
    };
    sucursal: {
        id: string;
        nombre: string;
    };
}

export type LotesResponse = PaginatedResponse<Lote>;
