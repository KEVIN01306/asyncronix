export interface Pais {
    id: string;
    codigo_iso: string;
    nombre: string;
    codigo_tel: string;
    moneda_id: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type PaisSimple = Omit<Pais, 'activo'>;
