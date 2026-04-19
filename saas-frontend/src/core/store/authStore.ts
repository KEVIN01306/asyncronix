import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    nombre: string;
    rol: 'ADMIN' | 'VENDEDOR';
    negocio_id: string;

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