import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { RouteProtector } from '../../../shared/components/RouteProtector';

const MovimientosListPage = lazy(() => import('./pages/MovimientosListPage'));
const MovimientoFormPage = lazy(() => import('./pages/MovimientoFormPage'));
const MovimientoDetailPage = lazy(() => import('./pages/MovimientoDetailPage'));

export const movimientosInternosRoutes: RouteObject[] = [
    {
        path: 'movimientos-internos',
        element: (
            <RouteProtector requiredPermission="VER_MOVIMIENTOS">
                <MovimientosListPage />
            </RouteProtector>
        ),
    },
    {
        path: 'movimientos-internos/nuevo',
        element: (
            <RouteProtector requiredPermission="CREAR_MOVIMIENTOS">
                <MovimientoFormPage />
            </RouteProtector>
        ),
    },
    {
        path: 'movimientos-internos/:id',
        element: (
            <RouteProtector requiredPermission="VER_MOVIMIENTOS_DETALLE">
                <MovimientoDetailPage />
            </RouteProtector>
        ),
    },
];
