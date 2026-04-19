import type { RouteObject } from 'react-router-dom';
import { SucursalDetailPage, SucursalesListPage, SucursalFormPage } from './sucursal-lazy';

export const sucursalRoutes: RouteObject[] = [
    {
        path: 'sucursales',
        children: [
            {
                index: true,
                element: (
                    <SucursalesListPage/>
                )
            },
            {
                path: ":id",
                element: (
                    <SucursalDetailPage/>
                )
            },
            {
                path: "nuevo",
                element: (
                    <SucursalFormPage/>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <SucursalFormPage/>
                )
            }
        ]
    },
];