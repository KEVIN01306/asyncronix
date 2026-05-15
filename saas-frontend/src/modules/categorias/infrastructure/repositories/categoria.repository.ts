import api from "../../../../core/api/api";
import type { CategoriasResponse } from "../../domain/interfaces/categoria.interface";


const URL_MODULE = '/categorias/'



export const  CategoriaRepository = {
    listar: async (limit: number = 10, offset: number = 0): Promise<CategoriasResponse> => {

        const response = await api.get<CategoriasResponse>(URL_MODULE, {
            params: { limit, offset }
        });

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