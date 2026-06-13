import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Proveedor, ProveedorCreateFormValues, ProveedorUpdateFormValues } from '../domain/interfaces/proveedor.interface';

const URL_MODULE = '/proveedores';

export const proveedoresRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<Proveedor>> => {
        const response = await api.get<PaginatedResponse<Proveedor>>(URL_MODULE, { params: { limit, offset, q }, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<Proveedor>> => {
        const response = await api.get<ApiResponse<Proveedor>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
    registrar: async (data: ProveedorCreateFormValues): Promise<ApiResponse<Proveedor>> => {
        const response = await api.post<ApiResponse<Proveedor>>(URL_MODULE, data);
        return response as any;
    },
    actualizar: async (id: string, data: ProveedorUpdateFormValues): Promise<ApiResponse<Proveedor>> => {
        const response = await api.put<ApiResponse<Proveedor>>(`${URL_MODULE}/${id}`, data);
        return response as any;
    },
    eliminar: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
};

export default proveedoresRepository;
