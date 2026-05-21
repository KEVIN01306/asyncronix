import api from "../../../core/api/api";
import type { Venta, VentaCreateForm, VentaUpdateForm, VentaResponse } from "../domain/interfaces/venta.interface";

export const ventaRepository = {
    listar: async (limit: number, page: number): Promise<VentaResponse> => {
        const response = await api.get<VentaResponse>('/ventas', { params: { page, limit } });
        return response as any;
    },
    obtener: async (id: string): Promise<{ data: Venta }> => {
        const response = await api.get<{ data: Venta }>(`/ventas/${id}`);
        return response as any;
    },
    registrar: async (data: VentaCreateForm): Promise<{ data: Venta }> => {
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
    actualizar: async (id: string, data: VentaUpdateForm): Promise<{ data: Venta }> => {
        const payload: any = {
            ...data
        };
        if (data.productos) {
            payload.productos = data.productos.map(p => ({
                producto_id: p.producto_id,
                cantidad: p.cantidad
            }));
        }
        const response = await api.put<{ data: Venta }>(`/ventas/${id}`, payload);
        return response as any;
    },
    anular: async (id: string, sucursal_id?: string, comentario?: string): Promise<{ data: Venta }> => {
        const response = await api.patch<{ data: Venta }>(`/ventas/${id}/anular`, { sucursal_id, comentario });
        return response as any;
    }
    ,
    crearDetalle: async (ventaId: string, detalle: { producto_id: string, cantidad: number }, sucursal_id: string): Promise<any> => {
        const payload = { producto_id: detalle.producto_id, cantidad: detalle.cantidad, sucursal_id };
        const response = await api.post(`/ventas/${ventaId}/detalles`, payload);
        return response as any;
    },
    eliminarDetalle: async (ventaId: string, detalleId: string, sucursal_id: string): Promise<any> => {
        const response = await api.delete(`/ventas/${ventaId}/detalles/${detalleId}`, { data: { sucursal_id } });
        return response as any;
    },
    finalizarVenta: async (ventaId: string, sucursal_id: string, metodo_pago?: string): Promise<{ data: Venta }> => {
        const response = await api.patch<{ data: Venta }>(`/ventas/${ventaId}/finalizar`, { sucursal_id, metodo_pago });
        return response as any;
    }
};
