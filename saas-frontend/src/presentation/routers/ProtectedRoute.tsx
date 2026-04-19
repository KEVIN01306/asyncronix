import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';

export const ProtectedRoute = () => {
    const isAuth = useAuthStore((state) => state.isAuthenticated);

    if (!isAuth) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};