import api from "../../../../core/api/api";
import type { ChecklistItemDetailResponse, ChecklistItemsResponse } from "../../../checklist-items/domain/interfaces/checklist-item.interface";

const URL_MODULE = '/checklist-items/';

export const ChecklistItemRepository = {
    listar: async (limit: number = 10, offset: number = 0): Promise<ChecklistItemsResponse> => {
        const response = await api.get<ChecklistItemsResponse>(URL_MODULE, {
            params: { limit, offset }
        });

        return response;
    },

    Obtener: async (id: string) => {
        const response = await api.get<ChecklistItemDetailResponse>(`${URL_MODULE}${id}`);
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
