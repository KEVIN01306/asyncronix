import type { RouteObject } from 'react-router-dom';
import { ServiciosListPage, ServicioFormPage, ServicioDetailPage, ServicioProgresoPage } from './servicio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const servicioRoutes: RouteObject[] = [
    {
        path: 'servicios',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS">
                        <ServiciosListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_SERVICIOS">
                        <ServicioFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/progreso',
                element: (
                    <RouteProtector requiredPermission="EDITAR_SERVICIOS">
                        <ServicioProgresoPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS_DETALLE">
                        <ServicioDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_SERVICIOS">
                        <ServicioFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
