import type { RouteObject } from 'react-router-dom';
import { ModelosListPage, ModeloDetailPage, ModelosCreatePage } from './modelos.lazy';
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
            { path: 'nuevo', element: (
                <RouteProtector requiredPermission="CREAR_MODELO">
                    <ModelosCreatePage />
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
