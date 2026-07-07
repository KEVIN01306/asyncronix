import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type {
    Transaccion,
    TransaccionDetalle,
    MovimientoFormValues,
} from '../domain/interfaces/movimiento.interface';

const URL_MODULE = '/movimientos';

export interface ListarMovimientosParams {
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

export const movimientoRepository = {
    listar: async (params: ListarMovimientosParams, signal?: AbortSignal): Promise<PaginatedResponse<Transaccion>> => {
        const response = await api.get<PaginatedResponse<Transaccion>>(URL_MODULE, { params, signal });
        return response as any;
    },

    obtener: async (id: string): Promise<ApiResponse<TransaccionDetalle>> => {
        const response = await api.get<ApiResponse<TransaccionDetalle>>(`${URL_MODULE}/${id}`);
        return response as any;
    },

    crear: async (data: MovimientoFormValues): Promise<ApiResponse<TransaccionDetalle>> => {
        const response = await api.post<ApiResponse<TransaccionDetalle>>(URL_MODULE, data);
        return response as any;
    },
};

export default movimientoRepository;
