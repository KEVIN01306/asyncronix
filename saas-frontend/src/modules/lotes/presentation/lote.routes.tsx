import type { RouteObject } from 'react-router-dom';
import { LoteDetailPage, LoteCreatePage, LoteListPage } from './lote-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const loteRoutes: RouteObject[] = [
    {
        path: 'lotes',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_LOTES">
                        <LoteListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'crear',
                element: (
                    <RouteProtector requiredPermission="CREAR_LOTES">
                        <LoteCreatePage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_LOTES_DETALLE">
                        <LoteDetailPage />
                    </RouteProtector>
                )
            }
        ]
    }
]
