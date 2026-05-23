import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';

export type Cilindrada = { id: string; cilindrada: number; created_at: string; updated_at: string };

const URL = '/cilindradas';

export const cilindradasRepository = {
    listar: async (limit: number, offset: number): Promise<PaginatedResponse<Cilindrada>> => {
        const response = await api.get<PaginatedResponse<Cilindrada>>(URL, { params: { limit, offset } });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Cilindrada>> => {
        const response = await api.get<ApiResponse<Cilindrada>>(`${URL}/${id}`);
        return response as any;
    }
};
