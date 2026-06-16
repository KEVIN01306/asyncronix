import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';
import { authRepository } from '../../modules/auth/infrastructure/repositories/auth.repository';
import { FullPageLoader } from '../../shared/components/ui/Loaders/FullPageLoader';

export const ProtectedRoute = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    
    const user = useAuthStore((state) => state.user);
    const isAuth = useAuthStore((state) => state.isAuthenticated);
    const getMeStore = useAuthStore((state) => state.getMe);
    const refreshTokenStore = useAuthStore((state) => state.refreshToken);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        const validarSesion = async () => {
            const token = localStorage.getItem('accessToken');

            // Si no hay token, no intentar refresh - ir directo a login
            if (!token) {
                setHasCheckedAuth(true);
                setIsLoading(false);
                return;
            }

            if (!user || !isAuth) {
                try {
                    const refreshResponse = await authRepository.refreshToken();
                    const accessToken = refreshResponse?.accessToken;

                    if (!accessToken) {
                        throw new Error('No se obtuvo accessToken en el refresh');
                    }

                    refreshTokenStore(accessToken);
                    const usuario = await authRepository.getMe();
                    getMeStore(usuario);
                } catch (error) {
                    logout();
                    console.error('Error al validar la sesión', error);
                } finally {
                    setHasCheckedAuth(true);
                    setIsLoading(false);
                }
            } else {
                setHasCheckedAuth(true);
                setIsLoading(false);
            }
        };

        validarSesion();
    }, [user, isAuth, getMeStore, refreshTokenStore, logout]);

    if (isLoading) {
        return <FullPageLoader message="Validando sesión..." />;
    }

    if (hasCheckedAuth && !isAuth) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};