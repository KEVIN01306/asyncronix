import api from "../../../core/api/api";
import type { TrasladoCrearForm, TrasladoDetalle, TrasladoResponse } from "../domain/interfaces/traslado.interface";

export interface TrasladoListQuery {
    q?: string | null;
    guia?: string | null;
    creador?: string | null;
    recibidor?: string | null;
    estado?: string | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    fecha_recibido_inicio?: string | null;
    fecha_recibido_fin?: string | null;
}

export const trasladoRepository = {
    listarPorOrigen: async (
        origen_id: string,
        limit: number,
        offset: number,
        query?: TrasladoListQuery,
        signal?: AbortSignal,
    ): Promise<TrasladoResponse> => {
        const params: any = { limit, offset };
        if (query?.q) params.q = query.q;
        if (query?.guia) params.guia = query.guia;
        if (query?.creador) params.creador = query.creador;
        if (query?.recibidor) params.recibidor = query.recibidor;
        if (query?.estado) params.estado = query.estado;
        if (query?.fecha_inicio) params.fecha_inicio = query.fecha_inicio;
        if (query?.fecha_fin) params.fecha_fin = query.fecha_fin;
        if (query?.fecha_recibido_inicio) params.fecha_recibido_inicio = query.fecha_recibido_inicio;
        if (query?.fecha_recibido_fin) params.fecha_recibido_fin = query.fecha_recibido_fin;

        const response = await api.get<TrasladoResponse>(`/traslados/origen/${origen_id}`, {
            params,
            signal,
        });
        return response as any;
    },

    listarPorDestino: async (
        destino_id: string,
        limit: number,
        offset: number,
        query?: TrasladoListQuery,
        signal?: AbortSignal,
    ): Promise<TrasladoResponse> => {
        const params: any = { limit, offset };
        if (query?.q) params.q = query.q;
        if (query?.guia) params.guia = query.guia;
        if (query?.creador) params.creador = query.creador;
        if (query?.recibidor) params.recibidor = query.recibidor;
        if (query?.estado) params.estado = query.estado;
        if (query?.fecha_inicio) params.fecha_inicio = query.fecha_inicio;
        if (query?.fecha_fin) params.fecha_fin = query.fecha_fin;
        if (query?.fecha_recibido_inicio) params.fecha_recibido_inicio = query.fecha_recibido_inicio;
        if (query?.fecha_recibido_fin) params.fecha_recibido_fin = query.fecha_recibido_fin;

        const response = await api.get<TrasladoResponse>(`/traslados/destino/${destino_id}`, {
            params,
            signal,
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

    cancelar: async (id: string, comentario: string): Promise<{ data: null }> => {
        const response = await api.put<{ data: null }>(`/traslados/${id}/cancelar`, { comentario });
        return response as any;
    },

    recibir: async (id: string, comentario: string): Promise<{ data: null }> => {
        const response = await api.put<{ data: null }>(`/traslados/${id}/recibir`, { comentario });
        return response as any;
    }
};
