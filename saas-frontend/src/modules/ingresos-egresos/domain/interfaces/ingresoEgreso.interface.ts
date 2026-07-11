export type TipoMovimiento = 'INGRESO' | 'EGRESO';
export type TipoEntidadFinanciera = 'CAJA' | 'CUENTA';

// ──────────────────────────────────────────────────────────────────────────────
// Semantic entity returned by the API for Ingresos / Egresos
// ──────────────────────────────────────────────────────────────────────────────

export interface IngresoEgresoEntidad {
    tipo: TipoEntidadFinanciera;
    id: string;
    /** Nombre de caja, or número de cuenta */
    nombre: string | null;
    /** Only present when tipo === 'CUENTA' */
    banco?: string | null;
    /** Only present when tipo === 'CUENTA' */
    moneda_codigo?: string | null;
}

export interface IngresoEgreso {
    id: string;
    correlativo: number;
    codigo: string;
    tipo: TipoMovimiento;
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
    /** Currency in which the original amount is expressed */
    moneda: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
    /** Business base currency (only present when different from moneda) */
    moneda_base: {
        id: string;
        codigo: string;
        nombre: string;
        simbolo: string;
    } | null;
    /** Financial entity involved (destination for INGRESO, origin for EGRESO) */
    entidad: IngresoEgresoEntidad | null;
    fechas: {
        transaccion: string;
        creacion: string;
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Form values (sent to the API to create an Ingreso/Egreso)
// ──────────────────────────────────────────────────────────────────────────────

export interface IngresoEgresoFormValues {
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

// ──────────────────────────────────────────────────────────────────────────────
// Options for form selects
// ──────────────────────────────────────────────────────────────────────────────

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
