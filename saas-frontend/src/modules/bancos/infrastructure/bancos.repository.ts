import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Banco } from '../domain/interface/banco.interface';

const URL = '/bancos';

export const bancosRepository = {
  listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<Banco>> => {
    const params: any = { limit, offset };
    if (q) params.q = q;
    const response = await api.get<PaginatedResponse<Banco>>(URL, { params, signal });
    return response as any;
  },
  obtener: async (id: string): Promise<ApiResponse<Banco>> => {
    const response = await api.get<ApiResponse<Banco>>(`${URL}/${id}`);
    return response as any;
  }
};
