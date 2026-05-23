export interface Marca {
    id: string;
    marca: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type MarcaSimple = Omit<Marca, 'activo'>;
