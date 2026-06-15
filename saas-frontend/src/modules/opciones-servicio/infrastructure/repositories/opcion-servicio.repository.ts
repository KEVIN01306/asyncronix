import api from "../../../../core/api/api";
import type { OpcionesServicioResponse, OpcionServicioDetailResponse } from "../../../opciones-servicio/domain/interfaces/opcion-servicio.interface";

const URL_MODULE = '/opciones-servicio/';

export const OpcionServicioRepository = {
    listar: async (limit: number = 10, offset: number = 0, q?: string | null, signal?: AbortSignal): Promise<OpcionesServicioResponse> => {
        const params: any = { limit, offset };
        if (q) params.q = q;

        const response = await api.get<OpcionesServicioResponse>(URL_MODULE, {
            params,
            signal
        });

        return response;
    },

    Obtener: async (id: string) => {
        const response = await api.get<OpcionServicioDetailResponse>(`${URL_MODULE}${id}`);
        return response.data;
    },

    registrar: async (data: any) => {
        const response = await api.post(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: any) => {
        const response = await api.put(`${URL_MODULE}${id}`, data);
        return response.data;
    },

    eliminar: async (id: string) => {
        const response = await api.delete(`${URL_MODULE}${id}`);
        return response.data;
    }
};
