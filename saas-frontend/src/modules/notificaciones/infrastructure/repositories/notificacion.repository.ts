import api from '../../../../core/api/api';

export const notificacionRepository = {

  guardarTokenFCM: async (token: string) => {
    try {
      const response = await api.post('/notifications/save-token', {
        token,
      });
      return response.data;
    } catch (error) {
      console.error('Error al guardar token FCM:', error);
      throw error;
    }
  },
};
