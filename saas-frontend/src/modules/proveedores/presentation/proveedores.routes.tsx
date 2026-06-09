import type { RouteObject } from 'react-router-dom';
import { ProveedoresListPage, ProveedorFormPage, ProveedorDetallePage } from './proveedores.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const proveedoresRoutes: RouteObject[] = [
    {
        path: 'proveedores',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_PROVEEDORES">
                        <ProveedoresListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_PROVEEDORES">
                        <ProveedorFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_PROVEEDORES_DETALLE">
                        <ProveedorDetallePage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_PROVEEDORES">
                        <ProveedorFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
