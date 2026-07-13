import api from "../../../../core/api/api";
import type { ApiResponse, PaginatedResponse } from '../../../../core/api/interfaces/api-response.interface';
import type { Modulo, Permiso, Rol, RolDetailResponse, RolesResponse } from "../../domain/interfaces/rol.interface";

const URL_MODULE = '/roles/';

export const RolesRepository = {
    listar: async (limit: number = 10, offset: number = 0, q?: string, signal?: AbortSignal): Promise<RolesResponse> => {
        const response = await api.get<RolesResponse>(URL_MODULE, {
            params: { limit, offset, q },
            signal
        });

        return response;
    },

    obtener: async (id: string): Promise<Rol> => {
        const response = await api.get<RolDetailResponse>(`${URL_MODULE}${id}`);
        return response.data;
    },

    listarModulos: async () => {
        const response = await api.get<PaginatedResponse<Modulo>>('/permisos/modulos', {
            params: { page: 1, perPage: 1000 }
        });

        return response;
    },

    listarPermisos: async (modulo_id?: string) => {
        const params: any = { page: 1, perPage: 1000 };
        if (modulo_id) params.modulo_id = modulo_id;
        
        const response = await api.get<PaginatedResponse<Permiso>>('/permisos', {
            params
        });

        return response;
    },

    obtenerPermisosRol: async (id: string): Promise<Permiso[]> => {
        const response = await api.get<ApiResponse<Permiso[]>>(`/permisos/roles/${id}`);
        return response.data;
    },

    asignarPermisosRol: async (id: string, permisoIds: string[]): Promise<Permiso[]> => {
        const response = await api.put<ApiResponse<Permiso[]>>(`/permisos/roles/${id}`, { permisoIds });
        return response.data;
    },

    registrar: async (data: Omit<Rol, 'id'>): Promise<Rol> => {
        const response = await api.post<RolDetailResponse>(URL_MODULE, data);
        return response.data;
    },

    actualizar: async (id: string, data: Omit<Rol, 'id'>): Promise<Rol> => {
        const response = await api.put<RolDetailResponse>(`${URL_MODULE}${id}`, data);
        return response.data;
    },
};
