import api from '../../../../core/api/api';
import type { Servicio, ServicioDetailResponse, ServiciosResponse } from '../../../servicios/domain/interfaces/servicio.interface';

const URL_MODULE = '/servicios';

export const servicioRepository = {
    listar: async (limit: number = 10, offset: number = 0): Promise<ServiciosResponse> => {
        const response = await api.get<ServiciosResponse>(`${URL_MODULE}`, {
            params: { limit, offset }
        });
        return response as any;
    },

    obtener: async (id: string): Promise<Servicio> => {
        const response = await api.get<ServicioDetailResponse>(`${URL_MODULE}/${id}`);
        return response.data;
    },

    registrar: async (data: any): Promise<Servicio> => {
        const response = await api.post<ServicioDetailResponse>(`${URL_MODULE}`, data);
        return response.data;
    },

    actualizar: async (id: string, data: any): Promise<Servicio> => {
        const response = await api.put<ServicioDetailResponse>(`${URL_MODULE}/${id}`, data);
        return response.data;
    },

    cambiarEstado: async (id: string, estado: string): Promise<Servicio> => {
        const response = await api.patch<ServicioDetailResponse>(`${URL_MODULE}/${id}/estado`, { estado });
        return response.data.data;
    },

    subirImagen: async (id: string, file: File, descripcion?: string): Promise<Servicio> => {
        const formData = new FormData();
        formData.append('imagen', file);
        if (descripcion) formData.append('descripcion', descripcion);

        const response = await api.post<ServicioDetailResponse>(`${URL_MODULE}/${id}/imagenes`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    eliminarImagen: async (id: string, imagenId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/imagenes/${imagenId}`);
    },

    listarChecklistRespuestas: async (id: string): Promise<any[]> => {
        const response = await api.get<any>(`${URL_MODULE}/${id}/checklist-respuestas`);
        return response.data.data;
    },

    registrarChecklistRespuesta: async (id: string, data: any): Promise<any> => {
        const response = await api.post<any>(`${URL_MODULE}/${id}/checklist-respuestas`, data);
        return response.data.data;
    },

    actualizarChecklistRespuesta: async (id: string, respuestaId: string, data: any): Promise<any> => {
        const response = await api.put<any>(`${URL_MODULE}/${id}/checklist-respuestas/${respuestaId}`, data);
        return response.data.data;
    },

    eliminarChecklistRespuesta: async (id: string, respuestaId: string): Promise<void> => {
        await api.delete(`${URL_MODULE}/${id}/checklist-respuestas/${respuestaId}`);
    }
};
