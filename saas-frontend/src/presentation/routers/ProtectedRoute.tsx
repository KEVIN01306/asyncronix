import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';

export const ProtectedRoute = () => {
    const location = useLocation()
    
    const isAuth = useAuthStore((state) => state.isAuthenticated);

    if (!isAuth) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};