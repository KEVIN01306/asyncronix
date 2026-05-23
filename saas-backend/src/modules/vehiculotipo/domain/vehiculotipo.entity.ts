export interface VehiculoTipo {
    id: string;
    tipo: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export type VehiculoTipoSimple = Omit<VehiculoTipo, 'activo'>;
