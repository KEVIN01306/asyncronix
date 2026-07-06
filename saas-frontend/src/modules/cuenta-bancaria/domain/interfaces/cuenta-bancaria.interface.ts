import type { Banco } from '../../../bancos/domain/interface/banco.interface';
import type { Moneda } from '../../../monedas/domain/interface/moneda.interface';

export interface CuentaBancaria {
    id: string;
    banco_id: string;
    banco?: Pick<Banco, 'id' | 'nombre_comercial'>;
    moneda_id: string | null;
    moneda?: Moneda | null;
    numero_cuenta: string;
    nombre_titular: string;
    tipo: 'MONETARIA' | 'AHORRO' | 'PLANILLA';
    saldo: number;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface CuentaBancariaCreateFormValues {
    banco_id: string;
    moneda_id?: string | null;
    numero_cuenta: string;
    nombre_titular: string;
    tipo?: 'MONETARIA' | 'AHORRO' | 'PLANILLA';
    activo?: boolean;
}

export type CuentaBancariaUpdateFormValues = CuentaBancariaCreateFormValues;
