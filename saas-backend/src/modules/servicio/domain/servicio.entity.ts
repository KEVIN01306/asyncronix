export interface ImagenServicio {
    id: string;
    servicio_id: string;
    url: string;
    created_at: Date;
    updated_at: Date;
}

export interface ChecklistRespuestaSimple {
    id: string;
    checklist_item_id: string;
    servicio_id: string;
    estado: string;
    observaciones?: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface Servicio {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    vehiculo_id: string;
    mecanico_id?: string | null;
    cliente_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion?: string | null;
    diagnostico?: string | null;
    kilometraje?: number | null;
    fecha_entrada?: Date;
    fecha_salida?: Date | null;
    total?: number;
    estado: string;
    MetodoPago: string;
    activo?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export type ServicioSimple = Pick<Servicio, 'id' | 'sucursal_id' | 'vehiculo_id' | 'cliente_id' | 'tipo_servicio_id' | 'estado' | 'total' | 'created_at'>;

export interface ServicioDetalle extends Servicio {
    imagenes: ImagenServicio[];
    checklist: ChecklistRespuestaSimple[];
}

export type ServicioCrear = Omit<Servicio, 'id' | 'activo' | 'created_at' | 'updated_at' | 'fecha_entrada' | 'estado'> & {
    total?: number;
    estado?: string;
};

export type ServicioActualizar = Partial<Omit<Servicio, 'id' | 'negocio_id' | 'activo' | 'created_at' | 'updated_at'>>;
