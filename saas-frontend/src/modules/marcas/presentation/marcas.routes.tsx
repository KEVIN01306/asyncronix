import type { RouteObject } from 'react-router-dom';
import { MarcasListPage, MarcaDetailPage } from './marcas.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const marcasRoutes: RouteObject[] = [
    {
        path: 'marcas',
        children: [
            { index: true, element: (
                <RouteProtector requiredPermission="VER_MARCAS">
                    <MarcasListPage />
                </RouteProtector>
            )},
            { path: ':id', element: (
                <RouteProtector requiredPermission="VER_MARCAS_DETALLE">
                    <MarcaDetailPage />
                </RouteProtector>
            )}
        ]
    }
];
