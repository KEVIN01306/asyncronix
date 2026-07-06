import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { CuentaBancaria, CuentaBancariaCreateFormValues, CuentaBancariaUpdateFormValues } from '../domain/interfaces/cuenta-bancaria.interface';

const URL_MODULE = '/cuentas-bancarias';

export const cuentaBancariaRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<PaginatedResponse<CuentaBancaria>> => {
        const response = await api.get<PaginatedResponse<CuentaBancaria>>(URL_MODULE, { params: { limit, offset, q }, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<ApiResponse<CuentaBancaria>> => {
        const response = await api.get<ApiResponse<CuentaBancaria>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
    registrar: async (data: CuentaBancariaCreateFormValues): Promise<ApiResponse<CuentaBancaria>> => {
        const response = await api.post<ApiResponse<CuentaBancaria>>(URL_MODULE, data);
        return response as any;
    },
    actualizar: async (id: string, data: CuentaBancariaUpdateFormValues): Promise<ApiResponse<CuentaBancaria>> => {
        const response = await api.put<ApiResponse<CuentaBancaria>>(`${URL_MODULE}/${id}`, data);
        return response as any;
    },
    eliminar: async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`${URL_MODULE}/${id}`);
        return response as any;
    },
};

export default cuentaBancariaRepository;
