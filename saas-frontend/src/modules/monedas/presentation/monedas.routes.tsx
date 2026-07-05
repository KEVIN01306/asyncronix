import type { RouteObject } from 'react-router-dom';
import { MonedasListPage, MonedaDetailPage } from './monedas-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const monedasRoutes: RouteObject[] = [
    {
        path: 'monedas',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_MONEDAS">
                        <MonedasListPage />
                    </RouteProtector>
                )
            },
            {
                path: ":id",
                element: (
                    <RouteProtector requiredPermission="VER_DETALLE_MONEDA">
                        <MonedaDetailPage />
                    </RouteProtector>
                )
            }
        ]
    },
];
