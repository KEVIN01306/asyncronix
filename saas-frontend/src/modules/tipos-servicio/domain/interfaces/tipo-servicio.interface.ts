import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { OpcionServicio } from "../../../opciones-servicio/domain/interfaces/opcion-servicio.interface";

export interface TipoServicio {
    id: string;
    nombre: string;
    precio_base: number;
    activo: boolean;
    checklist: boolean;
    opciones: OpcionServicio[];
    created_at: string;
    updated_at: string;
}

export type TipoServicioDetailResponse = ApiResponse<TipoServicio>;
export type TiposServicioResponse = PaginatedResponse<TipoServicio>;
