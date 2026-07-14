import type { BancoSimple } from '../../banco/domain/banco.entity.js';
import type { MonedaSimple } from '../../moneda/domain/moneda.entity.js';

export interface CuentaBancaria {
    id: string;
    negocio_id: string;
    banco_id: string;
    moneda_id: string | null;
    numero_cuenta: string;
    nombre_titular: string;
    tipo: 'MONETARIA' | 'AHORRO' | 'PLANILLA';
    saldo: number;
    saldo_moneda_base: number | null;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type CuentaBancariaSimple = Omit<CuentaBancaria, 'negocio_id'> & {
    banco: BancoSimple;
    moneda: MonedaSimple | null;
};

export type CuentaBancariaObtenidoDetalle = CuentaBancariaSimple;

export interface CuentaBancariaCrear {
    banco_id: string;
    moneda_id?: string | null;
    numero_cuenta: string;
    nombre_titular: string;
    tipo?: 'MONETARIA' | 'AHORRO' | 'PLANILLA';
    activo?: boolean;
}

export interface CuentaBancariaActualizar extends Partial<CuentaBancariaCrear> {}
