import type { RouteObject } from 'react-router-dom';
import { VentasLazy, VentaFormLazy, VentaDetalleLazy } from './ventas.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const ventasRoutes: RouteObject = {
    path: 'ventas',
    children: [
        {
            index: true,
            element: (
                <RouteProtector requiredPermission="VER_VENTAS">
                    <VentasLazy />
                </RouteProtector>
            )
        },
        {
            path: 'nuevo',
            element: (
                <RouteProtector requiredPermission="CREAR_VENTAS">
                    <VentaFormLazy />
                </RouteProtector>
            )
        },
        {
            path: 'editar/:id',
            element: (
                <RouteProtector requiredPermission="EDITAR_VENTAS">
                    <VentaFormLazy />
                </RouteProtector>
            )
        },
        {
            path: ':id',
            element: (
                <RouteProtector requiredPermission="VER_VENTAS_DETALLE">
                    <VentaDetalleLazy />
                </RouteProtector>
            )
        }
    ]
};
