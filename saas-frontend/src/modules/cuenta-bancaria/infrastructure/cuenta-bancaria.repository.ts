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
    obtenerHistorial: async (
        id: string,
        limit: number,
        offset: number,
        filters?: {
            q?: string;
            fecha_inicio?: string;
            fecha_fin?: string;
            tipo_movimiento?: string;
            origen_tipos?: string[];
        },
        signal?: AbortSignal
    ): Promise<PaginatedResponse<TransaccionHistorial>> => {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        if (filters?.q) params.append('q', filters.q);
        if (filters?.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
        if (filters?.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
        if (filters?.tipo_movimiento) params.append('tipo_movimiento', filters.tipo_movimiento);
        if (filters?.origen_tipos && filters.origen_tipos.length > 0) {
            filters.origen_tipos.forEach(o => params.append('origen_tipos', o));
        }
        
        const response = await api.get<PaginatedResponse<TransaccionHistorial>>(`/ingresos-egresos/cuenta/${id}/historial`, { 
            params, 
            signal 
        });
        return response as any;
    },
};

export default cuentaBancariaRepository;
