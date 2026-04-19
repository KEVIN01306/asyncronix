import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";


export interface Sucursal {
    id: string;
    nombre: string;
    direccion: string;
    es_principal: boolean;
}

export type SucursalesResponse = PaginatedResponse<Sucursal>;

export type SucursalDetailResponse = ApiResponse<Sucursal>