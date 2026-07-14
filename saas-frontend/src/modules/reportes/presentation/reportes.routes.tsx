import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RouteProtector } from '../../../shared/components/RouteProtector';

const ReporteFinancieroPage = lazy(() => import('./pages/ReporteFinancieroPage'));

export const reportesRoutes: RouteObject[] = [
    {
        path: 'reportes',
        children: [
            {
                path: 'financiero',
                element: (
                    <RouteProtector requiredPermission="REPORTES_FINANCIERO">
                        <ReporteFinancieroPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
