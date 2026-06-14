import api from '../../../core/api/api';
import type { ApiResponse } from '../../../core/api/interfaces/api-response.interface';
import type { Vehiculo, VehiculosResponse } from '../domain/interfaces/vehiculo.interface';

const URL_MODULE = '/vehiculos';

export const vehiculoRepository = {
    listar: async (limit: number = 10, offset: number = 0, filters?: Record<string, any>): Promise<VehiculosResponse> => {
        const params: any = { limit, offset };
        if (filters?.q) params.q = filters.q;
        if (filters?.placa) params.placa = filters.placa;
        if (filters?.vehiculo_tipo_id) params.vehiculo_tipo_id = filters.vehiculo_tipo_id;
        if (filters?.modelo_id) params.modelo_id = filters.modelo_id;
        if (filters?.marca_id) params.marca_id = filters.marca_id;
        if (filters?.linea_id) params.linea_id = filters.linea_id;
        if (filters?.cliente_dpi) params.cliente_dpi = filters.cliente_dpi;

        const response = await api.get<VehiculosResponse>(URL_MODULE, { params });
        return response as any;
    },

    obtener: async (id: string): Promise<Vehiculo> => {
        const response = await api.get<ApiResponse<Vehiculo>>(`${URL_MODULE}/${id}`);
        return response.data;
    },

    buscarPorPlaca: async (placa: string): Promise<ApiResponse<Vehiculo | null>> => {
        const response = await api.get<ApiResponse<Vehiculo | null>>(`${URL_MODULE}/placa/${placa}`);
        return response;
    },

    registrar: async (data: any): Promise<Vehiculo> => {
        const response = await api.post<ApiResponse<Vehiculo>>(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: any): Promise<Vehiculo> => {
        const response = await api.put<ApiResponse<Vehiculo>>(`${URL_MODULE}/${id}`, data);
        return response.data;
    },

    subirAvatar: async (id: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('avatar', file);

        await api.post(`${URL_MODULE}/${id}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    subirCalcomania: async (id: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);

        await api.post(`${URL_MODULE}/${id}/calcomania`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
};
