import { create } from 'zustand';

interface User {
    id: string;
    nombre: string;
    apellido: string | null;
    email: string | null;
    telefono: string;
    avatar_url?: string | null;
    roles: string[];
    permisos: string[];
    negocio_id: string;
    sucursal_id?: string | null;
    negocio?: {
        id: string;
        nombre_comercial: string;
        logo_url: string | null;
        pais?: {
            id: string;
            codigo_iso: string;
            nombre: string;
            codigo_tel: string;
            moneda_id: string;
            locale?: string | null;
            activo: boolean;
            created_at: string;
            updated_at: string;
        } | null;
        moneda?: {
            id: string;
            codigo: string;
            nombre: string;
            simbolo: string;
            activo: boolean;
            created_at: string;
            updated_at: string;
        } | null;
    } | null;
}

interface AuthState {
    user: User | null;
    status: 'authenticated' | 'unauthenticated' | 'checking';
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    getMe: (user: User) => void;
    refreshToken: (token: string) => void;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    status: initialToken ? 'checking' : 'unauthenticated',
    isAuthenticated: Boolean(initialToken),
    login: (user, token) => {
        localStorage.setItem('accessToken', token);
        set({
            user,
            status: 'authenticated',
            isAuthenticated: true,
        });
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        set({
            user: null,
            status: 'unauthenticated',
            isAuthenticated: false,
        });
    },
    getMe: (user) => {
        set({
            user,
            status: 'authenticated',
            isAuthenticated: true,
        });
    },
    refreshToken: (token) => {
        localStorage.setItem('accessToken', token);
    },
}));