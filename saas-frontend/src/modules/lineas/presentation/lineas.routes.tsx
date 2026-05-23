import type { RouteObject } from 'react-router-dom';
import { LineasListPage, LineaDetailPage } from './lineas.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const lineasRoutes: RouteObject[] = [
    {
        path: 'lineas',
        children: [
            { index: true, element: (
                <RouteProtector requiredPermission="VER_LINEAS">
                    <LineasListPage />
                </RouteProtector>
            )},
            { path: ':id', element: (
                <RouteProtector requiredPermission="VER_LINEAS_DETALLE">
                    <LineaDetailPage />
                </RouteProtector>
            )}
        ]
    }
];
