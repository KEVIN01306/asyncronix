export interface FiltrosReporteFinanciero {
    sucursal_ids?: string[];
    fecha_inicio?: string;
    fecha_fin?: string;
    metodos_pago?: string[];
    entidad_tipos?: string[];
}

export interface MetodoPagoKPI {
    metodo: string;
    total: number;
    porcentaje: number;
}

export interface OrigenDineroKPI {
    origen: string;
    total: number;
    porcentaje: number;
}

export interface CajaKPI {
    id: string;
    nombre: string;
    saldo: number;
}

export interface CuentaBancariaKPI {
    id: string;
    banco: string;
    numero_cuenta: string;
    moneda_codigo: string;
    saldo: number;
    saldo_original: number;
    tasa_cambio: number;
}

export interface ConciliacionKPI {
    saldo_esperado: number;
    saldo_actual: number;
    diferencia: number;
}

export interface AgrupacionDetalleOrigen {
    entidad_tipo: 'CAJA' | 'CUENTA';
    entidad_id: string;
    entidad_nombre: string;
    metodo_pago: string;
    total: number;
    porcentaje: number;
}

export interface DetalleOrigenReporte {
    origen: string;
    total_ingresos: number;
    agrupaciones: AgrupacionDetalleOrigen[];
}

export interface ConciliacionFinanciera {
    saldo_esperado: number;
    saldo_actual: number;
    diferencia: number;
}

export interface ReporteFinanciero {
    kpis: {
        total_ingresos: number;
        total_egresos: number;
        flujo_neto: number;
        cantidad_ingresos: number;
        cantidad_egresos: number;
        total_movimientos: number;
    };
    distribucion: {
        por_metodo_pago: MetodoPagoKPI[];
        por_origen: OrigenDineroKPI[];
        entidades: {
            cajas: CajaKPI[];
            cuentas: CuentaBancariaKPI[];
        }
    };
    conciliacion: ConciliacionFinanciera;
}
