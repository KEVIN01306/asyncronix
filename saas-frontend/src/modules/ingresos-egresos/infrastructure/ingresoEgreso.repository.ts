import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type {
    IngresoEgreso,
    IngresoEgresoFormValues,
} from '../domain/interfaces/ingresoEgreso.interface';

const URL_MODULE = '/ingresos-egresos';

export interface ListarIngresosEgresosParams {
    limit: number;
    offset: number;
    q?: string;
    tipo_movimiento?: 'INGRESO' | 'EGRESO';
    categoria_id?: string;
    entidad_tipo?: 'CAJA' | 'CUENTA';
    entidad_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}

export const ingresoEgresoRepository = {
    listar: async (params: ListarIngresosEgresosParams, signal?: AbortSignal): Promise<PaginatedResponse<IngresoEgreso>> => {
        const response = await api.get<PaginatedResponse<IngresoEgreso>>(URL_MODULE, { params, signal });
        return response as any;
    },

    obtener: async (id: string): Promise<ApiResponse<IngresoEgreso>> => {
        const response = await api.get<ApiResponse<IngresoEgreso>>(`${URL_MODULE}/${id}`);
        return response as any;
    },

    crear: async (data: IngresoEgresoFormValues): Promise<ApiResponse<IngresoEgreso>> => {
        const response = await api.post<ApiResponse<IngresoEgreso>>(URL_MODULE, data);
        return response as any;
    },
};

export default ingresoEgresoRepository;
