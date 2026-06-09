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
    fecha_ingreso: string; // ISO date
    fecha_vencimiento?: string | null; // ISO date optional
    activo: boolean;
    variante: {
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

export interface LoteCrear extends Omit<Lote, 'id' | 'fecha_ingreso' | 'activo' | 'variante' | 'sucursal' | 'codigo_lote'> {
    codigo_lote?: string;
}

export interface LoteDetalle extends Lote { }
