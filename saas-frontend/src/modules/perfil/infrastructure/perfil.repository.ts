import api from "../../../core/api/api";
import type { ActualizarPerfilForm, CambiarPasswordForm } from "../domain/interfaces/perfil.interface";

export const perfilRepository = {
    obtenerPerfil: async () => {
        const response = await api.get('/usuarios/me');
        return response.data;
    },

    actualizarPerfil: async (data: ActualizarPerfilForm) => {
        const response = await api.patch('/usuarios/me', data);
        return response.data;
    },

    actualizarPinCaja: async (data: { pin_caja: string }) => {
        const response = await api.patch('/usuarios/me/pin-caja', data);
        return response.data;
    },

    actualizarPinModelo: async (data: { pin_modelo: string }) => {
        const response = await api.patch('/usuarios/me/pin-modelo', data);
        return response.data;
    },

    actualizarPinSucursal: async (data: { pin_sucursal: string }) => {
        const response = await api.patch('/usuarios/me/pin-sucursal', data);
        return response.data;
    },

    actualizarAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.patch('/usuarios/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    cambiarPassword: async (data: CambiarPasswordForm) => {
        const response = await api.patch('/usuarios/me/password', data);
        return response.data;
    },

    sendVerificationCode: async () => {
        const response = await api.post('/verification-code/send');
        return response.data;
    },

    verifyVerificationCode: async (code: string) => {
        const response = await api.post('/verification-code/verify', { code });
        return response.data;
    }
}
