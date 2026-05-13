import type { RouteObject } from 'react-router-dom';
import { CategoriaDetailPage, CategoriaFormPage, CategoriaListPage } from './categoria-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';


export const categoriaRoutes: RouteObject[] = [
    {
        path: 'categorias',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CATEGORIAS">
                        <CategoriaListPage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id",
                element: (
                    <RouteProtector requiredPermission="VER_CATEGORIAS_DETALLE">
                        <CategoriaDetailPage/>
                    </RouteProtector>
                )
            },
            {
                path: "nuevo",
                element: (
                    <RouteProtector requiredPermission="CREAR_CATEGORIAS">
                        <CategoriaFormPage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <RouteProtector requiredPermission="EDITAR_CATEGORIAS">
                        <CategoriaFormPage/>
                    </RouteProtector>
                )
            }
        ]
    },
];