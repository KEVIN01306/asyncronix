import type { RouteObject } from 'react-router-dom';
import { CategoriaDetailPage, CategoriaFormPage, CategoriaListPage } from './categoria-lazy';


export const categoriaRoutes: RouteObject[] = [
    {
        path: 'categorias',
        children: [
            {
                index: true,
                element: (
                    <CategoriaListPage/>
                )
            },
            {
                path: ":id",
                element: (
                    <CategoriaDetailPage/>
                )
            },
            {
                path: "nuevo",
                element: (
                    <CategoriaFormPage/>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <CategoriaFormPage/>
                )
            }
        ]
    },
];