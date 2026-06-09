import api from '../../../../core/api/api';
import type { Variante } from '../../domain/interfaces/producto.interface';

const URL_MODULE = '/productos/';

export const VarianteRepository = {
    listarPorProducto: async (producto_id: string): Promise<{ data: Variante[] }> => {
        const response = await api.get<{ data: Variante[] }>(`${URL_MODULE}${producto_id}/variantes`);
        return response;
    },

    crear: async (producto_id: string, payload: Omit<Variante, 'id' | 'stock_total' | 'activo' | 'sku' | 'qr_codigo' | 'url_imagen' | 'valores'>): Promise<Variante> => {
        const response = await api.post<{ data: Variante }>(`${URL_MODULE}${producto_id}/variantes`, payload);
        return response.data;
    },

    actualizar: async (id: string, payload: Partial<Omit<Variante, 'id' | 'producto_id' | 'stock_total' | 'activo' | 'sku' | 'qr_codigo' | 'url_imagen' | 'valores'>>): Promise<Variante> => {
        const response = await api.put<{ data: Variante }>(`${URL_MODULE}variantes/${id}`, payload);
        return response.data;
    },

    actualizarCodigoBarras: async (id: string, codigo_barras: string | null): Promise<Variante> => {
        const response = await api.post<{ data: Variante }>(`${URL_MODULE}variantes/${id}/codigo-barras`, {
            codigo_barras: codigo_barras?.trim() || null
        });
        return response.data;
    },

    generarQr: async (id: string): Promise<Variante> => {
        const response = await api.post<{ data: Variante }>(`${URL_MODULE}variantes/${id}/generar-qr`);
        return response.data;
    },

    subirImagen: async (id: string, file: File): Promise<Variante> => {
        const formData = new FormData();
        formData.append('imagen', file);

        const response = await api.post<{ data: Variante }>(`${URL_MODULE}variantes/${id}/imagen`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    eliminar: async (id: string): Promise<void> => {
        await api.delete(`${URL_MODULE}variantes/${id}`);
    }
};
