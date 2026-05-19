import type { RouteObject } from 'react-router-dom';
import { ProductoDetailPage, ProductoFormPage, ProductosListPage } from './producto-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const productoRoutes: RouteObject[] = [
    {
        path: 'productos',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_PRODUCTOS">
                        <ProductosListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_PRODUCTOS">
                        <ProductoFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_PRODUCTOS_DETALLE">
                        <ProductoDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_PRODUCTOS">
                        <ProductoFormPage />
                    </RouteProtector>
                )
            }
        ]
    },
];
