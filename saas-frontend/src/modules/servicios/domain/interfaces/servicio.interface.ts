import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';

export interface ImagenServicio {
    id: string;
    servicio_id: string;
    url: string;
    descripcion?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ChecklistRespuesta {
    id: string;
    checklist_item_id: string;
    servicio_id: string;
    estado: string;
    observaciones?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Servicio {
    id: string;
    sucursal_id: string;
    vehiculo_id: string;
    cliente_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion?: string | null;
    diagnostico?: string | null;
    kilometraje?: number | null;
    fecha_entrada?: string | null;
    fecha_salida?: string | null;
    total?: number | null;
    estado: string;
    MetodoPago: string;
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
    imagenes?: ImagenServicio[];
    checklist?: ChecklistRespuesta[];
}

export type ServicioDetailResponse = ApiResponse<Servicio>;
export type ServiciosResponse = PaginatedResponse<Servicio>;
