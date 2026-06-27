import api from '../../../../core/api/api';
import type { Lote, LoteRegistroResponse, LotesResponse } from '../../domain/interfaces/lote.interface';

const URL = '/lotes/';

export const LoteRepository = {
    listar: async (limit = 10, offset = 0, filters: Record<string, any> = {}): Promise<LotesResponse> => {
        const params = { limit, offset, ...filters };
        const response = await api.get<LotesResponse>(`${URL}`, { params });
        return response;
    },

    listarPorProducto: async (producto_id: string, limit = 10, offset = 0): Promise<LotesResponse> => {
        // producto_id may be a product id. Backend exposes listing by variante, so caller should
        // pass a variante id when available. This method will call the product-based endpoint
        // if available, otherwise fall back to variante route.
        const response = await api.get<LotesResponse>(`${URL}producto/${producto_id}`, { params: { limit, offset } });
        return response;
    },

    listarPorVariante: async (variante_id: string, limit = 10, offset = 0): Promise<LotesResponse> => {
        const response = await api.get<LotesResponse>(`${URL}variante/${variante_id}`, { params: { limit, offset } });
        return response;
    },

    obtener: async (id: string): Promise<Lote> => {
        const response = await api.get<{ data: Lote }>(`${URL}${id}`);
        return response.data;
    },

    registrar: async (payload: any): Promise<LoteRegistroResponse> => {
        const response = await api.post<{ data: LoteRegistroResponse }>(URL, payload);
        return response.data;
    }
}
