export interface Banco {
    id: string;
    nombre_comercial: string;
    razon_social: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type BancoSimple = Pick<Banco, 'id' | 'nombre_comercial'>;
