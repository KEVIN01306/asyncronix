import api from "../../../../core/api/api";
import {type UsuariosResponse, type Usuario, type UsuarioDetailResponse } from "../../domain/interfaces/usuario.interface";

const URL_MODULO = '/usuarios/';


export const usuarioRepository = {

    listar: async ( limit: number, offset: number ) => {
        const response = await api.get<UsuariosResponse>(URL_MODULO, {
            params: { limit, offset }
        });

        return response;
    },

    obtener: async ( id: string ): Promise<Usuario> => {
        const response = await api.get<UsuarioDetailResponse>(`${URL_MODULO}${id}`);
        return response.data;
    },

    registrar: async ( data: Omit<Usuario, 'id'> ): Promise<Usuario> => {
        const response = await api.post<UsuarioDetailResponse>(URL_MODULO, data);
        return response.data;
    },

    actualizar: async ( id: string, data: Omit<Usuario, 'id'> ): Promise<Usuario> => {
        const response = await api.put<UsuarioDetailResponse>(`${URL_MODULO}${id}`, data);
        return response.data;
    },
}