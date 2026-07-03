import api from "../../../../core/api/api";
import type { ApiResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Producto, ProductosResponse, ProductoDetailResponse, ProductoAtributo, Variante, ImagenProducto } from "../../domain/interfaces/producto.interface";

const URL_MODULE = '/productos/';

export const ProductoRepository = {
    listar: async (limit: number = 10, offset: number = 0, categoria_id?: string, q?: string | null, sku?: string | null, signal?: AbortSignal): Promise<ProductosResponse> => {
        const params: any = { limit, offset };
        if (categoria_id) params.categoria_id = categoria_id;
        if (q) params.q = q;
        if (sku) params.sku = sku;

        const response = await api.get<ProductosResponse>(URL_MODULE, {
            params,
            signal,
        });

        return response;
    },

    obtener: async (id: string): Promise<Producto> => {
        const response = await api.get<ProductoDetailResponse>(`${URL_MODULE}${id}`);
        return response.data;
    },

    buscarPorCodigo: async (codigo: string): Promise<{ data: Variante | null }> => {
        const response = await api.get<{ data: Variante | null }>(`${URL_MODULE}scanner`, { params: { q: codigo } });
        return response;
    },

    registrar: async (data: any): Promise<Producto> => {
        const response = await api.post<ProductoDetailResponse>(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: any): Promise<Producto> => {
        const response = await api.put<ProductoDetailResponse>(`${URL_MODULE}${id}`, data);
        return response.data;
    },

    eliminar: async (id: string): Promise<void> => {
        await api.delete(`${URL_MODULE}${id}`);
    },

    subirImagen: async (id: string, file: File, descripcion?: string | null): Promise<Producto> => {
        const formData = new FormData();
        formData.append('imagen', file);
        if (descripcion !== undefined) formData.append('descripcion', descripcion ?? '');

        const response = await api.post<ProductoDetailResponse>(`${URL_MODULE}imagenes/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    listarImagenes: async (producto_id: string): Promise<ImagenProducto[]> => {
        const response = await api.get<ApiResponse<ImagenProducto[]>>(`${URL_MODULE}${producto_id}/imagenes`);
        return response.data;
    },

    actualizarArchivoImagen: async (imagen_id: string, file: File): Promise<ImagenProducto> => {
        const formData = new FormData();
        formData.append('imagen', file);

        const response = await api.put<ApiResponse<ImagenProducto>>(`${URL_MODULE}imagenes/${imagen_id}/archivo`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    actualizarDescripcionImagen: async (imagen_id: string, descripcion: string | null): Promise<ImagenProducto> => {
        const response = await api.patch<ApiResponse<ImagenProducto>>(`${URL_MODULE}imagenes/${imagen_id}/descripcion`, { descripcion });
        return (response as any).data;
    },

    establecerImagenPrincipal: async (imagen_id: string): Promise<ImagenProducto> => {
        const response = await api.post<ApiResponse<ImagenProducto>>(`${URL_MODULE}imagenes/${imagen_id}/principal`);
        return (response as any).data;
    },

    eliminarImagen: async (imagen_id: string): Promise<void> => {
        await api.delete(`${URL_MODULE}imagenes/${imagen_id}`);
    },

    obtenerAtributos: async (id: string): Promise<ProductoAtributo[]> => {
        const response = await api.get<ApiResponse<ProductoAtributo[]>>(`${URL_MODULE}${id}/atributos`);
        return response.data;
    },

    actualizarAtributos: async (id: string, atributo_ids: string[]): Promise<ProductoAtributo[]> => {
        const response = await api.put<ApiResponse<ProductoAtributo[]>>(`${URL_MODULE}${id}/atributos`, { atributos: atributo_ids });
        return response.data;
    },

    generarQr: async (id: string): Promise<string | null> => {
        const response = await api.post<ApiResponse<{ qr_imagen?: string | null }>>(`${URL_MODULE}qr/${id}`);
        return response.data.qr_imagen ?? null;
    },
};
