export interface Linea {
    id: string;
    linea: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type LineaSimple = Omit<Linea, 'activo'>;
