import type { RouteObject } from 'react-router-dom';
import { ClientesListPage, ClienteFormPage, ClienteDetallePage } from './clientes.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const clientesRoutes: RouteObject[] = [
    {
        path: 'clientes',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CLIENTES">
                        <ClientesListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_CLIENTES">
                        <ClienteFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/detalle',
                element: (
                    <RouteProtector requiredPermission="VER_CLIENTES_DETALLE">
                        <ClienteDetallePage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CLIENTES">
                        <ClienteFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
