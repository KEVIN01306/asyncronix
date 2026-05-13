import type { RouteObject } from 'react-router-dom';
import { SucursalDetailPage, SucursalesListPage, SucursalFormPage } from './sucursal-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const sucursalRoutes: RouteObject[] = [
    {
        path: 'sucursales',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_SUCURSALES">
                        <SucursalesListPage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id",
                element: (
                    <RouteProtector requiredPermission="VER_SUCURSALES_DETALLE">
                        <SucursalDetailPage/>
                    </RouteProtector>
                )
            },
            {
                path: "nuevo",
                element: (
                    <RouteProtector requiredPermission="CREAR_SUCURSALES">
                        <SucursalFormPage/>
                    </RouteProtector>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <RouteProtector requiredPermission="EDITAR_SUCURSALES">
                        <SucursalFormPage/>
                    </RouteProtector>
                )
            }
        ]
    },
];