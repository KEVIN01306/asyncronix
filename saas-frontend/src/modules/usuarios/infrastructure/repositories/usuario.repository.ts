import api from "../../../../core/api/api";
import {type UsuariosResponse, type Usuario, type UsuarioDetailResponse } from "../../domain/interfaces/usuario.interface";
import type { Rol } from '../../../roles/domain/interfaces/rol.interface';
import type { PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { CambiarPasswordForm } from '../../../perfil/domain/interfaces/perfil.interface';

const URL_MODULO = '/usuarios/';

type UsuarioCreateDTO = {
    nombre: string;
    apellido: string | null;
    email: string;
    telefono: string;
    rolIds: string[];
    sucursal_id: string | null;
    password_hash: string;
};

type UsuarioUpdateDTO = {
    nombre: string;
    apellido: string | null;
    email: string;
    telefono: string;
    rolIds: string[];
    sucursal_id: string | null;
};

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

    registrar: async ( data: UsuarioCreateDTO ): Promise<Usuario> => {
                console.log("usuario enviado: ",data)

        const response = await api.post<UsuarioDetailResponse>(URL_MODULO, data);
        return response.data;
    },

    actualizar: async ( id: string, data: UsuarioUpdateDTO ): Promise<Usuario> => {
        const response = await api.put<UsuarioDetailResponse>(`${URL_MODULO}${id}`, data);
        return response.data;
    },

    listarRoles: async () => {
        const response = await api.get<PaginatedResponse<Rol>>('/roles', {
            params: { limit: 100, offset: 0 }
        });
        return response;
    },

    restablecerContrasena: async (id: string, data: CambiarPasswordForm) => {
        const response = await api.patch(`${URL_MODULO}${id}/restablecer-contrasena`, data);
        return response.data;
    },
}