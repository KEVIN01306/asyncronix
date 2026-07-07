import api from '../../../core/api/api';
import type { CategoriaTransaccion, CategoriaTransaccionApiResponse, CategoriaTransaccionFormValues, CategoriaTransaccionListResponse } from '../domain/interfaces/categoria-transaccion.interface';

const URL = '/categoria-transaccion';

export const categoriaTransaccionRepository = {
  listar: async (limit = 10, offset = 0, q?: string, tipo?: string, signal?: AbortSignal): Promise<CategoriaTransaccionListResponse> => {
    const params: Record<string, string | number> = { limit, offset };
    if (q?.trim()) params.q = q.trim();
    if (tipo) params.tipo = tipo;
    const response = await api.get<CategoriaTransaccionListResponse>(URL, { params, signal });
    return response as CategoriaTransaccionListResponse;
  },
  obtener: async (id: string): Promise<CategoriaTransaccionApiResponse<CategoriaTransaccion>> => {
    const response = await api.get<CategoriaTransaccionApiResponse<CategoriaTransaccion>>(`${URL}/${id}`);
    return response as CategoriaTransaccionApiResponse<CategoriaTransaccion>;
  },
  crear: async (data: CategoriaTransaccionFormValues): Promise<CategoriaTransaccionApiResponse<CategoriaTransaccion>> => {
    const response = await api.post<CategoriaTransaccionApiResponse<CategoriaTransaccion>>(URL, data);
    return response as CategoriaTransaccionApiResponse<CategoriaTransaccion>;
  },
  actualizar: async (id: string, data: CategoriaTransaccionFormValues): Promise<CategoriaTransaccionApiResponse<CategoriaTransaccion>> => {
    const response = await api.put<CategoriaTransaccionApiResponse<CategoriaTransaccion>>(`${URL}/${id}`, data);
    return response as CategoriaTransaccionApiResponse<CategoriaTransaccion>;
  },
  eliminar: async (id: string): Promise<CategoriaTransaccionApiResponse<null>> => {
    const response = await api.delete<CategoriaTransaccionApiResponse<null>>(`${URL}/${id}`);
    return response as CategoriaTransaccionApiResponse<null>;
  },
};
