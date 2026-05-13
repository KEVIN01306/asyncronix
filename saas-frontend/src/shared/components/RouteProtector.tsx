import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';
import { toast } from 'sonner';

interface RouteProtectorProps {
    children: ReactNode;
    requiredPermission: string;
}

export const RouteProtector = ({ children, requiredPermission }: RouteProtectorProps) => {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (!user?.permisos.includes(requiredPermission)) {
        toast.error('Acceso denegado', {
            description: 'No tienes permisos para esto.',
        });
        return <Navigate to="/acceso-denegado" replace />;
    }

    return <>{children}</>;
};