import type { RouteObject } from 'react-router-dom';
import { UsuarioDetailPage, UsuariosListPage, UsuarioCreatePage, UsuarioEditPage } from './usuario-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const usuarioRoutes: RouteObject[] = [
    {
        path: 'usuarios',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_USUARIOS">
                        <UsuariosListPage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id",
                element: (
                    <RouteProtector requiredPermission="VER_USUARIOS_DETALLE">
                        <UsuarioDetailPage/>
                    </RouteProtector>
                )
            },
            {
                path: "nuevo",
                element: (
                    <RouteProtector requiredPermission="CREAR_USUARIOS">
                        <UsuarioCreatePage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <RouteProtector requiredPermission="EDITAR_USUARIOS">
                        <UsuarioEditPage/>
                    </RouteProtector>
                )
            }
        ]
    },
];