import type { RouteObject } from 'react-router-dom';
import { MovimientoListPage, MovimientoFormPage, MovimientoDetailPage } from './movimiento.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const movimientoRoutes: RouteObject[] = [
    {
        path: 'movimientos',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_MOVIMIENTOS">
                        <MovimientoListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_MOVIMIENTOS">
                        <MovimientoFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_MOVIMIENTOS_DETALLE">
                        <MovimientoDetailPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
