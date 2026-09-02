import api from '../../../core/api/api';
import type { ApiResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Departamento, Municipio } from '../domain/interface/geografia.interface';

const URL = '/geografia';

export const geografiaRepository = {
    obtenerDepartamentos: async (pais_id: string, signal?: AbortSignal): Promise<Departamento[]> => {
        const response = await api.get<ApiResponse<Departamento[]>>(`${URL}/departamentos`, {
            params: { pais_id },
            signal
        });
        return response.data as unknown as Departamento[];
    },
    obtenerMunicipios: async (departamento_id: string, signal?: AbortSignal): Promise<Municipio[]> => {
        const response = await api.get<ApiResponse<Municipio[]>>(`${URL}/municipios`, {
            params: { departamento_id },
            signal
        });
        return response.data as unknown as Municipio[];
    }
};
