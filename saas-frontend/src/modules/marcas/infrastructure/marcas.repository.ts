import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Marca } from '../domain/interface/marca.interface';

const URL = '/marcas';

export const marcasRepository = {
    listar: async (limit: number, offset: number): Promise<PaginatedResponse<Marca>> => {
        const response = await api.get<PaginatedResponse<Marca>>(URL, { params: { limit, offset } });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Marca>> => {
        const response = await api.get<ApiResponse<Marca>>(`${URL}/${id}`);
        return response as any;
    }
};
