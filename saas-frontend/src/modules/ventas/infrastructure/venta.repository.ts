import api from "../../../core/api/api";
import type { PreVenta, PreVentaCreateForm, Venta, VentaCreateForm, VentaUpdateForm, VentaResponse, VentaVarianteDetalle } from "../domain/interfaces/venta.interface";

export const ventaRepository = {
    listar: async (limit: number, offset: number, cliente_id?: string | null, metodo_pago?: string | null, q?: string | null, fecha_inicio?: string | null, fecha_fin?: string | null, signal?: AbortSignal): Promise<VentaResponse> => {
        const params: any = { offset, limit };
        if (cliente_id) params.cliente_id = cliente_id;
        if (metodo_pago) params.metodo_pago = metodo_pago;
        if (q) params.q = q;
        if (fecha_inicio) params.fecha_inicio = fecha_inicio;
        if (fecha_fin) params.fecha_fin = fecha_fin;
        const response = await api.get<VentaResponse>('/ventas', { params, signal });
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
    agregarProducto: async (ventaId: string, codigo: string, sucursal_id: string, cantidad = 1): Promise<any> => {
        const payload = { codigo, cantidad, sucursal_id };
        const response = await api.post(`/ventas/${ventaId}/agregar-producto`, payload);
        return response as any;
    },
    eliminarDetalle: async (ventaId: string, detalleId: string, sucursal_id: string): Promise<any> => {
        const response = await api.delete(`/ventas/${ventaId}/detalles/${detalleId}`, { data: { sucursal_id } });
        return response as any;
    },
    finalizarVenta: async (ventaId: string, sucursal_id: string, metodo_pago?: string): Promise<{ data: Venta }> => {
        const response = await api.patch<{ data: Venta }>(`/ventas/${ventaId}/finalizar`, { sucursal_id, metodo_pago });
        return response as any;
    },
    crearPreVenta: async (data: PreVentaCreateForm): Promise<{ data: PreVenta }> => {
        const response = await api.post<{ data: PreVenta }>('/ventas/pre-ventas', data);
        return response as any;
    },
    listarPreVentas: async (): Promise<{ data: PreVenta[] }> => {
        const response = await api.get<{ data: PreVenta[] }>('/ventas/pre-ventas');
        return response as any;
    },
    obtenerPreVenta: async (id: string): Promise<{ data: PreVenta }> => {
        const response = await api.get<{ data: PreVenta }>(`/ventas/pre-ventas/${id}`);
        return response as any;
    },
    actualizarCantidadPreVenta: async (detalleId: string, cantidad: number): Promise<any> => {
        const response = await api.patch(`/ventas/pre-ventas/detalles/${detalleId}/cantidad`, { cantidad });
        return response as any;
    },
    eliminarDetallePreVenta: async (detalleId: string): Promise<any> => {
        const response = await api.delete(`/ventas/pre-ventas/detalles/${detalleId}`);
        return response as any;
    },
    finalizarPreVenta: async (id: string, payload?: { metodo_pago?: string; comentarios?: string | null; override_stock?: boolean; pin_caja?: string; efectivo_recibido?: number | null; vuelto?: number | null }): Promise<any> => {
        const response = await api.patch(`/ventas/pre-ventas/${id}/finalizar`, payload ?? {});
        return response as any;
    },
    actualizarClientePreVenta: async (id: string, cliente_id: string | null): Promise<any> => {
        const response = await api.patch(`/ventas/pre-ventas/${id}/cliente`, { cliente_id });
        return response as any;
    },
    validarPinCaja: async (pin: string): Promise<any> => {
        const response = await api.post('/ventas/pre-ventas/validar-pin', { pin_caja: pin });
        return response as any;
    }
    ,
    addDetallePreVenta: async (preventaId: string, item: { variante_id: string; cantidad: number; precio?: number; descripcion?: string }): Promise<any> => {
        const response = await api.post(`/ventas/pre-ventas/${preventaId}/detalles`, item);
        return response as any;
    }
};
