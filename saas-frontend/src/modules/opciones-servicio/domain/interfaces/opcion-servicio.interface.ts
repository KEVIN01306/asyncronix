import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface OpcionServicio {
    id: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export type OpcionServicioDetailResponse = ApiResponse<OpcionServicio>;
export type OpcionesServicioResponse = PaginatedResponse<OpcionServicio>;
