import type { RouteObject } from 'react-router-dom';
import { RolesCreatePage, RolesDetailPage, RolesEditPage, RolesListPage, RolePermissionsPage } from './roles-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const rolesRoutes: RouteObject[] = [
    {
        path: 'roles',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_ROLES">
                        <RolesListPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_ROLES_DETALLE">
                        <RolesDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/permisos',
                element: (
                    <RouteProtector requiredPermission="ASIGNAR_PERMISOS_ROL">
                        <RolePermissionsPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_ROLES">
                        <RolesCreatePage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_ROLES">
                        <RolesEditPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
