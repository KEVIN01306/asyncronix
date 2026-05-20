import api from "../../../core/api/api";
import type { Venta, VentaForm, VentaResponse } from "../domain/interfaces/venta.interface";

export const ventaRepository = {
    listar: async (page: number, limit: number): Promise<VentaResponse> => {
        const response = await api.get<VentaResponse>('/ventas', { params: { page, limit } });
        return response as any;
    },
    obtener: async (id: string): Promise<{ data: Venta }> => {
        const response = await api.get<{ data: Venta }>(`/ventas/${id}`);
        return response as any;
    },
    registrar: async (data: VentaForm): Promise<{ data: Venta }> => {
        // Remove client-side only fields before sending
        const payload = {
            ...data,
            productos: data.productos.map(p => ({
                producto_id: p.producto_id,
                cantidad: p.cantidad
            }))
        };
        const response = await api.post<{ data: Venta }>('/ventas', payload);
        return response as any;
    },
    actualizar: async (id: string, data: VentaForm): Promise<{ data: Venta }> => {
        const payload = {
            ...data,
            productos: data.productos.map(p => ({
                producto_id: p.producto_id,
                cantidad: p.cantidad
            }))
        };
        const response = await api.put<{ data: Venta }>(`/ventas/${id}`, payload);
        return response as any;
    },
    anular: async (id: string): Promise<{ data: Venta }> => {
        const response = await api.patch<{ data: Venta }>(`/ventas/${id}/anular`);
        return response as any;
    }
};
