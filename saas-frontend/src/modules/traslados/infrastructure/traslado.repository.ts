import api from "../../../core/api/api";
import type { TrasladoCrearForm, TrasladoDetalle, TrasladoResponse } from "../domain/interfaces/traslado.interface";

export const trasladoRepository = {
    listarPorOrigen: async (origen_id: string, limit: number, offset: number): Promise<TrasladoResponse> => {
        const response = await api.get<TrasladoResponse>(`/traslados/origen/${origen_id}`, {
            params: { limit, offset }
        });
        return response as any;
    },

    listarPorDestino: async (destino_id: string, limit: number, offset: number): Promise<TrasladoResponse> => {
        const response = await api.get<TrasladoResponse>(`/traslados/destino/${destino_id}`, {
            params: { limit, offset }
        });
        return response as any;
    },

    obtener: async (id: string): Promise<{ data: TrasladoDetalle }> => {
        const response = await api.get<{ data: TrasladoDetalle }>(`/traslados/${id}`);
        return response as any;
    },

    crear: async (data: TrasladoCrearForm): Promise<{ data: TrasladoDetalle }> => {
        const response = await api.post<{ data: TrasladoDetalle }>('/traslados', data);
        return response as any;
    },

    cancelar: async (id: string): Promise<{ data: null }> => {
        const response = await api.put<{ data: null }>(`/traslados/${id}/cancelar`, {});
        return response as any;
    },

    recibir: async (id: string): Promise<{ data: null }> => {
        const response = await api.put<{ data: null }>(`/traslados/${id}/recibir`, {});
        return response as any;
    }
};
