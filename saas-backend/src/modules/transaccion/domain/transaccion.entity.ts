export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';
export type TipoEntidadFinanciera = 'CAJA' | 'CUENTA';
export type TipoOrigenTransaccion = 'VENTA' | 'SERVICIO' | 'INGRESO_EGRESO' | 'MOVIMIENTO_INTERNO';

export interface Transaccion {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    categoria_id: string | null;
    usuario_id: string;
    tipo_movimiento: TipoMovimiento;
    origen_tipo: TipoOrigenTransaccion;
    moneda_id: string;
    monto_original: number;
    tipo_cambio: number;
    monto_moneda_base: number;
    descripcion: string | null;
    origen_entidad: TipoEntidadFinanciera | null;
    origen_caja_id: string | null;
    origen_cuenta_id: string | null;
    destino_entidad: TipoEntidadFinanciera | null;
    destino_caja_id: string | null;
    destino_cuenta_id: string | null;
    fecha_transaccion: Date;
    created_at: Date;
}

export interface TransaccionCrear {
    categoria_id: string;
    tipo_movimiento: TipoMovimiento;
    entidad_tipo: TipoEntidadFinanciera;
    entidad_id: string;
    moneda_id?: string; // Si no se envía, se usa la moneda del negocio
    monto_original: number;
    tipo_cambio?: number; // Si aplica conversión
    monto_moneda_base?: number; // Si aplica conversión
    descripcion?: string;
    fecha_transaccion?: Date;
}

export interface TransaccionDetalle extends Transaccion {
    categoria?: {
        id: string;
        nombre: string;
    } | null;
    usuario?: {
        id: string;
        nombre: string;
    };
    moneda?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    };
    negocio?: {
        id: string;
        moneda_id: string;
    };
    caja?: {
        id: string;
        nombre: string;
    } | null;
    cuenta?: {
        id: string;
        numero_cuenta: string;
        nombre_titular: string;
        banco?: {
            nombre_comercial: string;
        };
        moneda?: {
            codigo: string;
        };
    } | null;
}

export interface TransaccionSimple extends Omit<Transaccion, 'negocio_id' | 'sucursal_id'> {
    categoria_nombre?: string;
    usuario_nombre?: string;
    moneda_codigo?: string;
    entidad_nombre?: string;
}
