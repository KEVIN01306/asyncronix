export interface DescontarStockInput {
    lote_id: string;
    cantidad: number;
    negocio_id?: string;
    motivo?: string;
    permitirStockNegativo?: boolean;
}

export interface IncrementarStockInput {
    lote_id: string;
    cantidad: number;
    negocio_id?: string;
    motivo?: string;
}

export interface StockResultado {
    lote_id: string;
    variante_id: string;
    negocio_id: string;
    sucursal_id: string;
    cantidad_anterior: number;
    cantidad_modificada: number;
    cantidad_actual: number;
    activo: boolean;
    stock_total_variante: number;
}
