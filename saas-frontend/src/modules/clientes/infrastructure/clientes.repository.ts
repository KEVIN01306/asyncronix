import api from "../../../core/api/api";
import type { ApiResponse, PaginatedResponse } from "../../../core/api/interfaces/api-response.interface";
import type { Cliente, ClienteCreateFormValues, ClienteUpdateFormValues } from "../domain/interfaces/cliente.interface";

const URL_MODULE = '/clientes';

export const clienteRepository = {
    listar: async (limit: number, offset: number, q?: string | null, documento?: string | null, signal?: AbortSignal): Promise<PaginatedResponse<Cliente>> => {
        const params: any = { limit, offset };
        if (q) params.q = q;
        if (documento) params.documento = documento;
        const response = await api.get<PaginatedResponse<Cliente>>(URL_MODULE, { params, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Cliente>> => {
        const response = await api.get<ApiResponse<Cliente>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
    registrar: async (data: ClienteCreateFormValues): Promise<ApiResponse<Cliente>> => {
        const response = await api.post<ApiResponse<Cliente>>(URL_MODULE, data);
        return response as any;
    },
    actualizar: async (id: string, data: ClienteUpdateFormValues): Promise<ApiResponse<Cliente>> => {
        const response = await api.put<ApiResponse<Cliente>>(`${URL_MODULE}/${id}`, data);
        return response as any;
    },
    eliminar: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
    buscarPorDocumento: async (params: { nit?: string; dpi?: string }): Promise<ApiResponse<Cliente | null>> => {
        const response = await api.get<ApiResponse<Cliente | null>>(`${URL_MODULE}/buscar`, { params });
        return response as any;
    },
    buscarPorDpi: async (dpi: string): Promise<ApiResponse<Cliente | null>> => {
        const response = await api.get<ApiResponse<Cliente | null>>(`${URL_MODULE}/dpi/${encodeURIComponent(dpi)}`);
        return response as any;
    }
};
