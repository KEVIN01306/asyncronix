import api from "../../../../core/api/api";
import type { TipoServicioDetailResponse, TiposServicioResponse } from "../../../tipos-servicio/domain/interfaces/tipo-servicio.interface";

const URL_MODULE = '/tipos-servicio/';

export const TipoServicioRepository = {
    listar: async (limit: number = 10, offset: number = 0, q?: string | null, signal?: AbortSignal): Promise<TiposServicioResponse> => {
        const params: any = { limit, offset };
        if (q) params.q = q;

        const response = await api.get<TiposServicioResponse>(URL_MODULE, {
            params,
            signal
        });

        return response;
    },

    Obtener: async (id: string) => {
        const response = await api.get<TipoServicioDetailResponse>(`${URL_MODULE}${id}`);
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
