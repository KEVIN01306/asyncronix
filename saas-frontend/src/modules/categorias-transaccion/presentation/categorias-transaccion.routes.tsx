import type { RouteObject } from 'react-router-dom';
import { CategoriaTransaccionListPage, CategoriaTransaccionFormPage, CategoriaTransaccionDetailPage } from './categorias-transaccion.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const categoriasTransaccionRoutes: RouteObject[] = [
    {
        path: 'categorias-transaccion',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CATEGORIAS_TRANSACCION">
                        <CategoriaTransaccionListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_CATEGORIAS_TRANSACCION">
                        <CategoriaTransaccionFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_CATEGORIAS_TRANSACCION_DETALLE">
                        <CategoriaTransaccionDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CATEGORIAS_TRANSACCION">
                        <CategoriaTransaccionFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
