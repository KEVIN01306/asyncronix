export interface Caja {
    id: string;
    nombre: string;
    tipo: 'FISICA' | 'EN_LINEA';
    saldo: number;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface CajaCreateFormValues {
    nombre: string;
    tipo?: 'FISICA' | 'EN_LINEA';
    activo?: boolean;
}

export type CajaUpdateFormValues = CajaCreateFormValues;
