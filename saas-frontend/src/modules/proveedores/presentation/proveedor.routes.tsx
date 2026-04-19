import type { RouteObject } from 'react-router-dom';
import { ProveedorDetailPage, ProveedoresListPage, ProveedorFormPage } from './proveedor-lazy';


export const proveedorRoutes: RouteObject[] = [
    {
        path: 'proveedores',
        children: [
            {
                index: true,
                element: (
                    <ProveedoresListPage/>
                )
            },
            {
                path: ":id",
                element: (
                    <ProveedorDetailPage/>
                )
            },
            {
                path: "nuevo",
                element: (
                    <ProveedorFormPage/>
                )
            },
            {
                path: ":id/editar",
                element: (
                    <ProveedorFormPage/>
                )
            }
        ]
    },
];