import type { RouteObject } from 'react-router-dom';
import { CilindradasListPage, CilindradaDetailPage } from './cilindradas.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const cilindradasRoutes: RouteObject[] = [
    {
        path: 'cilindradas',
        children: [
            { index: true, element: (
                <RouteProtector requiredPermission="VER_CILINDRADAS">
                    <CilindradasListPage />
                </RouteProtector>
            )},
            { path: ':id', element: (
                <RouteProtector requiredPermission="VER_CILINDRADAS_DETALLE">
                    <CilindradaDetailPage />
                </RouteProtector>
            )}
        ]
    }
];
