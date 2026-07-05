import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Moneda } from '../domain/interface/moneda.interface';

const URL = '/monedas';

export const monedasRepository = {
  listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<Moneda>> => {
    const params: any = { limit, offset };
    if (q) params.q = q;
    const response = await api.get<PaginatedResponse<Moneda>>(URL, { params, signal });
    return response as any;
  },
  obtener: async (id: string): Promise<ApiResponse<Moneda>> => {
    const response = await api.get<ApiResponse<Moneda>>(`${URL}/${id}`);
    return response as any;
  }
};
