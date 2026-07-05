import type { RouteObject } from 'react-router-dom';
import { PaisesListPage, PaisDetailPage } from './paises-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const paisesRoutes: RouteObject[] = [
    {
        path: 'paises',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_PAISES">
                        <PaisesListPage />
                    </RouteProtector>
                )
            },
            {
                path: ":id",
                element: (
                    <RouteProtector requiredPermission="VER_DETALLE_PAIS">
                        <PaisDetailPage />
                    </RouteProtector>
                )
            }
        ]
    },
];
