import api from "../../../core/api/api";
import type { ApiResponse, PaginatedResponse } from "../../../core/api/interfaces/api-response.interface";
import type { Cliente, ClienteCreateFormValues, ClienteUpdateFormValues } from "../domain/interfaces/cliente.interface";

const URL_MODULE = '/clientes';

export const clienteRepository = {
    listar: async (limit: number, offset: number): Promise<PaginatedResponse<Cliente>> => {
        const response = await api.get<PaginatedResponse<Cliente>>(URL_MODULE, { params: { limit, offset } });
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
    buscarPorDocumento: async (params: { nit?: string | null; dpi?: string | null }): Promise<ApiResponse<Cliente | null>> => {
        const response = await api.get<ApiResponse<Cliente | null>>(`${URL_MODULE}/buscar`, { params });
        return response as any;
    }
};
