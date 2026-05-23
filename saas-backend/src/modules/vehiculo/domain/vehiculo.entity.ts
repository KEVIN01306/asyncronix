export interface Vehiculo {
    id: string;
    negocio_id: string;
    placa: string;
    modelo_id: string;
    avatar_url?: string | null;
    calcomania_url?: string | null;
    vehiculo_tipo_id: string;
    cliente_id?: string | null;
    activo?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type VehiculoSimple = Pick<Vehiculo, 'id' | 'placa' | 'avatar_url' | 'calcomania_url' | 'vehiculo_tipo_id' | 'modelo_id'>;

export type VehiculoDetalle = Vehiculo;

export type VehiculoCrear = Omit<Vehiculo, 'id' | 'activo' | 'created_at' | 'updated_at' | 'avatar_url' | 'calcomania_url'>;

export type VehiculoActualizar = Partial<VehiculoCrear>;
