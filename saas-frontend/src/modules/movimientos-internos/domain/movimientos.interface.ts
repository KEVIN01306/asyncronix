export type TipoEntidadFinanciera = 'CAJA' | 'CUENTA';

export interface EntidadFinancieraResumen {
    tipo: TipoEntidadFinanciera;
    id: string;
    nombre: string | null;
    banco?: string | null;
    moneda_codigo?: string | null;
}

export interface MovimientoInternoEntity {
    id: string;
    correlativo: number;
    codigo: string;
    descripcion: string | null;
    negocio: { id: string };
    sucursal: { id: string };
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
    origen: EntidadFinancieraResumen | null;
    destino: EntidadFinancieraResumen | null;
    fechas: {
        transaccion: string;
        creacion: string;
    };
}

export interface ListarMovimientosFiltros {
    q?: string;
    entidad_tipo?: TipoEntidadFinanciera;
    entidad_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}

export interface CrearMovimientoInternoDTO {
    origen_entidad: TipoEntidadFinanciera;
    origen_id: string;
    destino_entidad: TipoEntidadFinanciera;
    destino_id: string;
    monto_original: number;
    descripcion: string;
}
