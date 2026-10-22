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
    },
    buscarGlobal: async (params: { q?: string; documento?: string; limit?: number }): Promise<ApiResponse<Cliente[]>> => {
        const response = await api.get<ApiResponse<Cliente[]>>(`${URL_MODULE}/buscar-global`, { params });
        return response as any;
    },
    obtenerResumenUnificacion: async (origen_id: string, destino_id: string): Promise<ApiResponse<import("../domain/interfaces/cliente.interface").ResumenUnificacion>> => {
        const response = await api.get<ApiResponse<import("../domain/interfaces/cliente.interface").ResumenUnificacion>>(`${URL_MODULE}/unificar/resumen`, {
            params: { origen_id, destino_id },
        });
        return response as any;
    },
    unificar: async (data: import("../domain/interfaces/cliente.interface").UnificarClientesPayload): Promise<ApiResponse<{ message: string; cliente: Cliente }>> => {
        const response = await api.post<ApiResponse<{ message: string; cliente: Cliente }>>(`${URL_MODULE}/unificar`, data);
        return response as any;
    },
    consultarNitDigifact: async (nit: string): Promise<ApiResponse<{ nit: string, nombre: string }>> => {
        const response = await api.get<ApiResponse<{ nit: string, nombre: string }>>(`/facturacion/digifact/nit/${encodeURIComponent(nit)}`);
        return response as any;
    },
    reenviarCredenciales: async (id: string): Promise<ApiResponse<{ clienteId: string; email: string; notificacionEnviada: boolean }>> => {
        const response = await api.post<ApiResponse<{ clienteId: string; email: string; notificacionEnviada: boolean }>>(`${URL_MODULE}/${id}/reenviar-credenciales`);
        return response as any;
    }
};
