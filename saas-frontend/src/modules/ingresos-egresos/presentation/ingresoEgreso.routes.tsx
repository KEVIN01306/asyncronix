import type { RouteObject } from 'react-router-dom';
import { IngresoEgresoListPage, IngresoEgresoFormPage, IngresoEgresoDetailPage } from './ingresoEgreso.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const ingresoEgresoRoutes: RouteObject[] = [
    {
        path: 'ingresos-egresos',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_INGRESOS_EGRESOS">
                        <IngresoEgresoListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_INGRESOS_EGRESOS">
                        <IngresoEgresoFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_INGRESOS_EGRESOS_DETALLE">
                        <IngresoEgresoDetailPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
