import api from '../../../../core/api/api';
import type { LoginFormValues } from '../../domain/schemas/login.schema';
import type { LoginResponse } from '../../domain/interfaces/auth-response.interface';

export const authRepository = {
    signIn: async (credentials: LoginFormValues): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },
};