import api from "../../../core/api/api";
import type { Venta, VentaCreateForm, VentaUpdateForm, VentaResponse, VentaVarianteDetalle } from "../domain/interfaces/venta.interface";

export const ventaRepository = {
    listar: async (limit: number, offset: number, cliente_id?: string | null): Promise<VentaResponse> => {
        const params: any = { offset, limit };
        if (cliente_id) params.cliente_id = cliente_id;
        const response = await api.get<VentaResponse>('/ventas', { params });
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
                variante_id: p.producto_id,
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
                variante_id: p.producto_id,
                cantidad: p.cantidad
            }));
        }
        const response = await api.put<{ data: Venta }>(`/ventas/${id}`, payload);
        return response as any;
    },
    anular: async (id: string, sucursal_id?: string, comentario?: string): Promise<{ data: Venta }> => {
        const response = await api.patch<{ data: Venta }>(`/ventas/${id}/anular`, { sucursal_id, comentario });
        return response as any;
    },
    buscarPorCodigo: async (codigo: string): Promise<{ data: VentaVarianteDetalle }> => {
        const response = await api.get<{ data: VentaVarianteDetalle }>('/ventas/scanner', { params: { q: codigo } });
        return response as any;
    },
    buscarPorSku: async (sku: string): Promise<{ data: VentaVarianteDetalle }> => {
        return ventaRepository.buscarPorCodigo(sku);
    },
    crearDetallePorCodigo: async (ventaId: string, codigo: string, sucursal_id: string, cantidad = 1): Promise<any> => {
        const payload = { codigo, cantidad, sucursal_id };
        const response = await api.post(`/ventas/${ventaId}/detalles/codigo`, payload);
        return response as any;
    },
    crearDetallePorSku: async (ventaId: string, sku: string, sucursal_id: string, cantidad = 1): Promise<any> => {
        return ventaRepository.crearDetallePorCodigo(ventaId, sku, sucursal_id, cantidad);
    },
    crearDetalle: async (ventaId: string, detalle: { producto_id: string, cantidad: number }, sucursal_id: string): Promise<any> => {
        const payload = { variante_id: detalle.producto_id, cantidad: detalle.cantidad, sucursal_id };
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
