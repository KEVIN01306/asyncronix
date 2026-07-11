import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { CuentaBancaria, CuentaBancariaCreateFormValues, CuentaBancariaUpdateFormValues } from '../domain/interfaces/cuenta-bancaria.interface';

const URL_MODULE = '/cuentas-bancarias';

export interface TransaccionHistorial {
    id: string;
    codigo: string;
    fecha_transaccion: string;
    tipo_movimiento: string;
    origen_tipo: string;
    monto_original: number;
    descripcion?: string | null;
    origen_caja_id?: string | null;
    destino_caja_id?: string | null;
    origen_cuenta_id?: string | null;
    destino_cuenta_id?: string | null;
}

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
    obtenerHistorial: async (id: string, limit: number, offset: number, signal?: AbortSignal): Promise<PaginatedResponse<TransaccionHistorial>> => {
        const response = await api.get<PaginatedResponse<TransaccionHistorial>>(`/ingresos-egresos/cuenta/${id}/historial`, { params: { limit, offset }, signal });
        return response as any;
    },
};

export default cuentaBancariaRepository;
