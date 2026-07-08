export type TipoMovimiento = 'INGRESO' | 'EGRESO';
export type TipoEntidadFinanciera = 'CAJA' | 'CUENTA';

export interface Transaccion {
    id: string;
    tipo_movimiento: TipoMovimiento;
    categoria_id: string;
    categoria_nombre?: string;
    usuario_id: string;
    usuario_nombre?: string;
    moneda_id: string;
    moneda_actual_codigo?: string;
    moneda_codigo?: string;
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
    fecha_transaccion: string;
    entidad_nombre?: string;
    created_at: string;
}

export interface TransaccionDetalle extends Transaccion {
    negocio_id: string;
    sucursal_id: string;
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
    moneda_actual?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
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

export interface MovimientoFormValues {
    categoria_id: string;
    tipo_movimiento: TipoMovimiento;
    entidad_tipo: TipoEntidadFinanciera;
    entidad_id: string;
    moneda_id?: string;
    monto_original?: number;
    monto_moneda_base?: number;
    tipo_cambio?: number;
    descripcion?: string;
    fecha_transaccion?: string;
}

export interface CajaOption {
    id: string;
    nombre: string;
}

export interface CuentaOption {
    id: string;
    numero_cuenta: string;
    nombre_titular: string;
    banco_nombre: string;
    moneda_codigo: string;
}

export interface CategoriaOption {
    id: string;
    nombre: string;
    tipo: TipoMovimiento;
}
