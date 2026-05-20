import api from '../../../../core/api/api';
import type { Lote, LotesResponse } from '../../domain/interfaces/lote.interface';

const URL = '/lotes/';

export const LoteRepository = {
    listar: async (limit = 10, offset = 0): Promise<LotesResponse> => {
        const response = await api.get<LotesResponse>(`${URL}`, { params: { limit, offset } });
        return response;
    },

    listarPorProducto: async (producto_id: string, limit = 10, offset = 0): Promise<LotesResponse> => {
        const response = await api.get<LotesResponse>(`${URL}producto/${producto_id}`, { params: { limit, offset } });
        return response;
    },

    obtener: async (id: string): Promise<Lote> => {
        const response = await api.get<{ data: Lote }>(`${URL}${id}`);
        return response.data;
    },

    registrar: async (payload: any): Promise<Lote> => {
        const response = await api.post<{ data: Lote }>(URL, payload);
        return response.data;
    }
}
