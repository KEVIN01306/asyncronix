import api from "../../../../core/api/api";
import type { Sucursal, SucursalDetailResponse, SucursalesResponse } from "../../domain/interfaces/sucursal.interface";
import type { SucursalFormValues } from "../../domain/schemas/sucursal.schema";


const URL_MODULO = '/sucursales/';

export const sucursalRepository = {
    listar: async (limit: number, offset: number, q?: string, signal?: AbortSignal): Promise<SucursalesResponse> => {
        const response = await api.get<SucursalesResponse>(`${URL_MODULO}`, {
            params: { limit, offset, q },
            signal
        });
        return response;
    },

    obtener: async (id: string): Promise<Sucursal> => {
        const response = await api.get<SucursalDetailResponse>(`${URL_MODULO}${id}`);
        return response.data;
    },

    registrar:  async (data: SucursalFormValues): Promise<Sucursal> => {
        const response = await api.post<SucursalDetailResponse>(`${URL_MODULO}`, data);
        return response.data;
    },

    actualizar: async (id: string, data: SucursalFormValues): Promise<Sucursal> => {
        const response = await api.put<SucursalDetailResponse>(`${URL_MODULO}${id}`, data);
        return response.data;
    }
}