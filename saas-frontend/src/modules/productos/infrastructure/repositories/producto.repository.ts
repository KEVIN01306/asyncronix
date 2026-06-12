import api from "../../../../core/api/api";
import type { ApiResponse } from "../../../../core/api/interfaces/api-response.interface";
import type { Producto, ProductosResponse, ProductoDetailResponse, ProductoAtributo, Variante } from "../../domain/interfaces/producto.interface";

const URL_MODULE = '/productos/';

export const ProductoRepository = {
    listar: async (limit: number = 10, offset: number = 0, categoria_id?: string): Promise<ProductosResponse> => {
        const response = await api.get<ProductosResponse>(URL_MODULE, {
            params: {
                limit,
                offset,
                categoria_id,
            }
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

    subirImagen: async (id: string, file: File): Promise<Producto> => {
        const formData = new FormData();
        formData.append('imagen', file);

        const response = await api.post<ProductoDetailResponse>(`${URL_MODULE}imagenes/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
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
