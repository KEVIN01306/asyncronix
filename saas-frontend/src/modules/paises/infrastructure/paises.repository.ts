import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Pais } from '../domain/interface/pais.interface';

const URL = '/paises';

export const paisesRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<Pais>> => {
        const params: any = { limit, offset };
        if (q) params.q = q;
        const response = await api.get<PaginatedResponse<Pais>>(URL, { params, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Pais>> => {
        const response = await api.get<ApiResponse<Pais>>(`${URL}/${id}`);
        return response as any;
    }
};
