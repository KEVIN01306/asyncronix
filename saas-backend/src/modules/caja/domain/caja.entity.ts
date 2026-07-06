export interface Caja {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    nombre: string;
    tipo: 'FISICA' | 'EN_LINEA';
    saldo: number;
    ip_autorizada?: string | null;
    asociacion_id?: string | null;
    token_autorizado?: string | null;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type CajaSimple = Omit<Caja, 'negocio_id' | 'sucursal_id'>;
export type CajaObtenidoDetalle = CajaSimple;
export interface CajaCrear {
    nombre: string;
    tipo?: 'FISICA' | 'EN_LINEA';
    activo?: boolean;
}

export interface CajaActualizar extends Partial<CajaCrear> {}
