import type { RouteObject } from 'react-router-dom';
import { ModelosListPage, ModeloDetailPage } from './modelos.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const modelosRoutes: RouteObject[] = [
    {
        path: 'modelos',
        children: [
            { index: true, element: (
                <RouteProtector requiredPermission="VER_MODELOS">
                    <ModelosListPage />
                </RouteProtector>
            )},
            { path: ':id', element: (
                <RouteProtector requiredPermission="VER_MODELOS_DETALLE">
                    <ModeloDetailPage />
                </RouteProtector>
            )}
        ]
    }
];
