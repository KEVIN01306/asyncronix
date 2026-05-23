import api from '../../../core/api/api';
import type { PaginatedResponse } from '../../../core/api/interfaces/api-response.interface';
import type { VehiculoTipo } from '../domain/interfaces/vehiculo-tipo.interface';

const URL_MODULE = '/vehiculotipos';

export const vehiculoTipoRepository = {
    listar: async (limit: number = 100, offset: number = 0): Promise<PaginatedResponse<VehiculoTipo>> => {
        const response = await api.get<PaginatedResponse<VehiculoTipo>>(URL_MODULE, {
            params: {
                limit,
                offset,
            }
        });
        return response as any;
    },
};
