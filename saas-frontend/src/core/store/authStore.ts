import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    nombre: string;
    roles: string[];
    permisos: string[];
    negocio_id: string;
    negocio?: {
        id: string;
        nombre_comercial: string;
        logo_url: string | null;
    } | null;
}

interface AuthState {
    user: User | null;
    status: 'authenticated' | 'unauthenticated' | 'checking';
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            status: 'unauthenticated',
            isAuthenticated: false,
            login: (user, token) => {
                localStorage.setItem('accessToken', token);
                set({
                    user,
                    status: 'authenticated',
                    isAuthenticated: true
                });
            },
            logout: () => {
                localStorage.removeItem('accessToken');
                set({
                    user: null,
                    status: 'unauthenticated',
                    isAuthenticated: false
                });
            },
        }),
        { name: 'auth-storage' }
    )
);