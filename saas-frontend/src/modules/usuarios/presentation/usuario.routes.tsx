import type { RouteObject } from 'react-router-dom';
import { UsuarioFormPage, UsuariosListPage } from './usuario-lazy';

export const usuarioRoutes: RouteObject[] = [
    {
        path: 'usuarios',
        children: [
            {
                index: true,
                element: (
                    <UsuariosListPage/>
                )
            },
            {
                path: ":id",
                element: (
                    <UsuariosListPage/>
                )
            },
            {
                path: "nuevo",
                element: (
                    <UsuarioFormPage/>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <UsuarioFormPage/>
                )
            }
        ]
    },
];