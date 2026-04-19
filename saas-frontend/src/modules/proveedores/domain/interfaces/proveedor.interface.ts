import type { ApiResponse, PaginatedResponse } from "../../../../core/api/interfaces/api-response.interface";

export interface Proveedor {
    id: string;
    nombre: string;
    telefono: string;
}

export type ProveedoresResponse = PaginatedResponse<Proveedor>;

export type ProveedorDetailResponse = ApiResponse<Proveedor>