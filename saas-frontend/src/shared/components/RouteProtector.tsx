import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../core/store/authStore';
import { toast } from 'sonner';

interface RouteProtectorProps {
    children: React.ReactElement;
    requiredPermission: string | string[];
}

export const RouteProtector = ({ children, requiredPermission }: RouteProtectorProps) => {
    const { user, isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    const hasPermission = Array.isArray(requiredPermission)
        ? requiredPermission.every((permission) => user?.permisos.includes(permission))
        : user?.permisos.includes(requiredPermission);

    if (!hasPermission) {
        toast.error('Acceso denegado', {
            description: 'No tienes permisos para esto.',
        });
        return <Navigate to="/acceso-denegado" replace />;
    }

    return <>{children}</>;
};