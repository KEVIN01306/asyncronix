export type TipoMovimiento = 'INGRESO' | 'EGRESO' | 'TRANSFERENCIA';
export type TipoEntidadFinanciera = 'CAJA' | 'CUENTA';
export type TipoOrigenTransaccion = 'VENTA' | 'SERVICIO' | 'INGRESO_EGRESO' | 'MOVIMIENTO_INTERNO';

// ──────────────────────────────────────────────────────────────────────────────
// Raw domain entity (internal, mirrors the DB)
// ──────────────────────────────────────────────────────────────────────────────
export interface Transaccion {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    categoria_id: string | null;
    usuario_id: string;
    correlativo: number;
    codigo: string;
    tipo_movimiento: TipoMovimiento;
    origen_tipo: TipoOrigenTransaccion;
    moneda_id: string;
    moneda_actual_id: string | null;
    moneda_actual_codigo?: string;
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

// ──────────────────────────────────────────────────────────────────────────────
// Input for CrearIngresoEgresoUseCase (Ingresos / Egresos)
// ──────────────────────────────────────────────────────────────────────────────
export interface TransaccionCrear {
    categoria_id: string;
    tipo_movimiento: TipoMovimiento;
    entidad_tipo: TipoEntidadFinanciera;
    entidad_id: string;
    moneda_id?: string;
    monto_original: number;
    tipo_cambio?: number;
    monto_moneda_base?: number;
    descripcion?: string;
    fecha_transaccion?: Date;
    moneda_actual_id?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Input for CrearTransaccionUseCase (generic / flexible)
// Any caller is responsible for providing all fields.
// ──────────────────────────────────────────────────────────────────────────────
export interface TransaccionCrearDirecta {
    negocio_id: string;
    sucursal_id: string;
    usuario_id: string;
    categoria_id?: string | null;
    tipo_movimiento: TipoMovimiento;
    origen_tipo: TipoOrigenTransaccion;
    moneda_id: string;
    moneda_actual_id?: string | null;
    monto_original: number;
    tipo_cambio: number;
    monto_moneda_base: number;
    descripcion?: string | null;
    origen_entidad?: TipoEntidadFinanciera | null;
    origen_caja_id?: string | null;
    origen_cuenta_id?: string | null;
    destino_entidad?: TipoEntidadFinanciera | null;
    destino_caja_id?: string | null;
    destino_cuenta_id?: string | null;
    fecha_transaccion?: Date;
}

// ──────────────────────────────────────────────────────────────────────────────
// Semantic entity for the Ingresos-Egresos module (frontend-facing)
// ──────────────────────────────────────────────────────────────────────────────
export interface IngresoEgresoEntidad {
    tipo: TipoEntidadFinanciera;
    id: string;
    nombre: string | null;
    banco?: string | null;
    moneda_codigo?: string | null;
}

export interface IngresoEgresoEntity {
    id: string;
    correlativo: number;
    codigo: string;
    tipo: 'INGRESO' | 'EGRESO';
    descripcion: string | null;
    negocio: {
        id: string;
    };
    sucursal: {
        id: string;
    };
    categoria: {
        id: string;
        nombre: string;
    } | null;
    usuario: {
        id: string;
        nombre: string;
        apellido: string | null;
        avatar: string | null;
    };
    monto: {
        original: number;
        moneda_base: number;
        tipo_cambio: number;
    };
    moneda: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
    moneda_base: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
    entidad: IngresoEgresoEntidad | null;
    fechas: {
        transaccion: Date;
        creacion: Date;
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy detail / simple types (kept for backward compatibility with other modules)
// ──────────────────────────────────────────────────────────────────────────────
export interface TransaccionDetalle extends Omit<Transaccion, 'moneda_actual_id'> {
    categoria?: {
        id: string;
        nombre: string;
    } | null;
    usuario?: {
        id: string;
        nombre: string;
    } | null;
    moneda?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
    moneda_actual?: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
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

export interface TransaccionSimple extends Omit<Transaccion, 'negocio_id' | 'sucursal_id' | 'moneda_actual_id'> {
    categoria_nombre?: string;
    usuario_nombre?: string;
    moneda_codigo?: string;
    entidad_nombre?: string;
}
