export interface OpcionServicio {
    id: string;
    negocio_id: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface OpcionServicioCrear extends Omit<OpcionServicio, "id" | "negocio_id" | "activo" | "created_at" | "updated_at"> { }

export interface OpcionServicioActualizar extends Partial<Omit<OpcionServicio, "id" | "negocio_id" | "created_at" | "updated_at">> { }

export interface OpcionServicioSimple extends Omit<OpcionServicio, "negocio_id"> { }
