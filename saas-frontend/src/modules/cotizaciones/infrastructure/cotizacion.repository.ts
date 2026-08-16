import api from "../../../core/api/api";
import type {
    Cotizacion,
    CotizacionForm,
    ConvertirCotizacionForm,
    CotizacionResponse,
    EstadoCotizacion
} from "../domain/interfaces/cotizacion.interface";

export const cotizacionRepository = {
    listar: async (limit: number, offset: number, q?: string | null, estado?: string | null, cliente_id?: string | null, signal?: AbortSignal): Promise<CotizacionResponse> => {
        const params: any = { offset, limit };
        if (q) params.q = q;
        if (estado) params.estado = estado;
        if (cliente_id) params.cliente_id = cliente_id;

        const response = await api.get<CotizacionResponse>('/cotizaciones', { params, signal });
        return response as any;
    },
    obtener: async (id: string): Promise<{ data: Cotizacion }> => {
        const response = await api.get<{ data: Cotizacion }>(`/cotizaciones/${id}`);
        return response as any;
    },
    crear: async (data: CotizacionForm): Promise<{ data: Cotizacion }> => {
        const response = await api.post<{ data: Cotizacion }>('/cotizaciones', data);
        return response as any;
    },
    actualizarEstado: async (id: string, estado: EstadoCotizacion): Promise<{ data: Cotizacion }> => {
        const response = await api.put<{ data: Cotizacion }>(`/cotizaciones/${id}/estado`, { estado });
        return response as any;
    },
    convertir: async (id: string, data: ConvertirCotizacionForm): Promise<{ data: any }> => {
        const response = await api.post<{ data: any }>(`/cotizaciones/${id}/convertir`, data);
        return response as any;
    }
};
