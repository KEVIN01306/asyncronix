import type { OpcionServicioSimple } from "../../opcion-servicio/domain/opcion-servicio.entity.js";

export interface TipoServicio {
    id: string;
    negocio_id: string;
    nombre: string;
    precio_base: number;
    activo: boolean;
    opciones: OpcionServicioSimple[];
    created_at: Date;
    updated_at: Date;
}

export interface TipoServicioCrear extends Omit<TipoServicio, "id" | "negocio_id" | "activo" | "created_at" | "updated_at"> {
    opciones_ids?: string[];
}

export interface TipoServicioActualizar extends Partial<Omit<TipoServicio, "id" | "negocio_id" | "created_at" | "updated_at" | "opciones">> {
    opciones_ids?: string[];
}

export interface TipoServicioSimple extends Omit<TipoServicio, "negocio_id"> { }
