export interface Moneda {
    id: string;
    codigo: string;
    nombre: string;
    simbolo: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type MonedaSimple = Omit<Moneda, 'activo'>;
