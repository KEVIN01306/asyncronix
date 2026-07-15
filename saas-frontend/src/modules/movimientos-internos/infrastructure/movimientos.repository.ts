import api from '../../../core/api/api';
import type { ApiResponse, PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { 
    CrearMovimientoInternoDTO, 
    ListarMovimientosFiltros, 
    MovimientoInternoEntity 
} from '../domain/movimientos.interface';

const URL_MODULE = '/movimientos-internos';

export const movimientosRepository = {
    crearMovimiento: async (data: CrearMovimientoInternoDTO): Promise<ApiResponse<MovimientoInternoEntity>> => {
        const response = await api.post<ApiResponse<MovimientoInternoEntity>>(URL_MODULE, data);
        return response as any;
    },

    obtenerMovimientos: async (
        limit: number, 
        offset: number, 
        filters?: ListarMovimientosFiltros,
        signal?: AbortSignal
    ): Promise<PaginatedResponse<MovimientoInternoEntity>> => {
        const response = await api.get<PaginatedResponse<MovimientoInternoEntity>>(URL_MODULE, { 
            params: { limit, offset, ...filters },
            signal 
        });
        return response as any;
    },

    obtenerDetalleMovimiento: async (id: string): Promise<ApiResponse<MovimientoInternoEntity>> => {
        const response = await api.get<ApiResponse<MovimientoInternoEntity>>(`${URL_MODULE}/${id}`);
        return response as any;
    }
};

export default movimientosRepository;
