import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Modelo } from '../domain/interface/modelo.interface';

const URL = '/modelos';

export const modelosRepository = {
    listar: async (limit: number, offset: number, filters?: { marca_id?: string[]; linea_id?: string[]; cilindrada_id?: string[] }): Promise<PaginatedResponse<Modelo>> => {
        const params: any = { limit, offset };
        if (filters?.marca_id?.length) params.marca_id = filters.marca_id;
        if (filters?.linea_id?.length) params.linea_id = filters.linea_id;
        if (filters?.cilindrada_id?.length) params.cilindrada_id = filters.cilindrada_id;
        const response = await api.get<PaginatedResponse<Modelo>>(URL, { params });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Modelo>> => {
        const response = await api.get<ApiResponse<Modelo>>(`${URL}/${id}`);
        return response as any;
    }
};
