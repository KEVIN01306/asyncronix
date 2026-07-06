import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Caja, CajaCreateFormValues, CajaUpdateFormValues } from '../domain/interfaces/caja.interface';

const URL_MODULE = '/cajas';

export const cajaRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<Caja>> => {
        const response = await api.get<PaginatedResponse<Caja>>(URL_MODULE, { params: { limit, offset, q }, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Caja>> => {
        const response = await api.get<ApiResponse<Caja>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
    registrar: async (data: CajaCreateFormValues): Promise<ApiResponse<Caja>> => {
        const response = await api.post<ApiResponse<Caja>>(URL_MODULE, data);
        return response as any;
    },
    actualizar: async (id: string, data: CajaUpdateFormValues): Promise<ApiResponse<Caja>> => {
        const response = await api.put<ApiResponse<Caja>>(`${URL_MODULE}/${id}`, data);
        return response as any;
    },
    eliminar: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
};

export default cajaRepository;
