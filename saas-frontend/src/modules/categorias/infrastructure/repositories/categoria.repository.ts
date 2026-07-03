import api from "../../../../core/api/api";
import type { CategoriasResponse, CategoriaJerarquiaResponse, CategoriasDisponiblesResponse } from "../../domain/interfaces/categoria.interface";


const URL_MODULE = '/categorias/'



export const  CategoriaRepository = {
    listar: async (limit: number = 10, offset: number = 0, q?: string | null, signal?: AbortSignal): Promise<CategoriasResponse> => {
        const params: any = { limit, offset };
        if (q) params.q = q;

        const response = await api.get<CategoriasResponse>(URL_MODULE, {
            params,
            signal,
        });

        return response;
    },

    obtenerConJerarquia: async (id: string): Promise<CategoriaJerarquiaResponse> => {
        const response = await api.get<CategoriaJerarquiaResponse>(`${URL_MODULE}${id}/jerarquia`)
        return response;
    },

    obtenerPadresDisponibles: async (categoriaIdExcluir?: string): Promise<CategoriasDisponiblesResponse> => {
        const response = await api.get<CategoriasDisponiblesResponse>(`${URL_MODULE}padres-disponibles`, {
            params: categoriaIdExcluir ? { categoria_id_excluir: categoriaIdExcluir } : undefined
        })
        return response;
    },

    Obtener: async (id: string) => {
        const response = await api.get(`${URL_MODULE}${id}`)

        return response.data;
    },

    registrar: async (data: any) => {
        const response = await api.post(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: any) => {
        const response = await api.put(`${URL_MODULE}${id}`, data);
        return response.data;
    },

    eliminar: async (id: string) => {
        const response = await api.delete(`${URL_MODULE}${id}`);
        return response.data;
    }
}