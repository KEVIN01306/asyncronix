export interface Lote {
    id: string;
    producto_id: string;
    negocio_id: string;
    sucursal_id: string;
    cantidad_actual: number;
    costo_compra: number;
    precio_venta: number;
    fecha_ingreso: string; // ISO date
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

export interface LoteCrear extends Omit<Lote, 'id' | 'fecha_ingreso' | 'activo' | 'producto' | 'sucursal'> { }

export interface LoteDetalle extends Lote { }
