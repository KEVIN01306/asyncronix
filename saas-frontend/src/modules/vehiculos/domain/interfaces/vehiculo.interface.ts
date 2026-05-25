import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';

export interface Vehiculo {
    id: string;
    placa: string;
    modelo_id: string;
    vehiculo_tipo_id: string;
    avatar_url?: string | null;
    calcomania_url?: string | null;
    cliente_id?: string | null;
    modelo_nombre?: string | null;
    marca?: string | null;
    linea?: string | null;
    cilindrada?: number | null;
    tipo_vehiculo?: string | null;
    cliente?: {
        id: string;
        nombre: string;
        nit?: string | null;
        dpi?: string | null;
    } | null;
    activo?: boolean;
    created_at?: string;
    updated_at?: string;
}

export type VehiculoResponse = ApiResponse<Vehiculo>;
export type VehiculosResponse = PaginatedResponse<Vehiculo>;
