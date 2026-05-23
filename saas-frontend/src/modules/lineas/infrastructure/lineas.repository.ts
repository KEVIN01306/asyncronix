import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Linea } from '../domain/interface/linea.interface';

const URL = '/lineas';

export const lineasRepository = {
    listar: async (limit: number, offset: number): Promise<PaginatedResponse<Linea>> => {
        const response = await api.get<PaginatedResponse<Linea>>(URL, { params: { limit, offset } });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Linea>> => {
        const response = await api.get<ApiResponse<Linea>>(`${URL}/${id}`);
        return response as any;
    }
};
