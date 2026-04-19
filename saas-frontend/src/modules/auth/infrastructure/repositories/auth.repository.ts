import api from '../../../../core/api/api';
import type { LoginFormValues } from '../../domain/schemas/login.schema';

export const authRepository = {
    signIn: async (credentials: LoginFormValues) => {
        const response = await api.post('/auth/login', credentials);
        console.log(response.data)
        return response.data;
    }
};