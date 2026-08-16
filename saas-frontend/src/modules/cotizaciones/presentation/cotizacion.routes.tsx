import type { RouteObject } from 'react-router-dom';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import {
    CotizacionListPageLazy,
    CotizacionCreatePageLazy,
    CotizacionEditPageLazy,
    CotizacionDetailPageLazy
} from './cotizaciones.lazy';

export const cotizacionesRoutes: RouteObject[] = [
    {
        path: 'cotizaciones',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_COTIZACIONES">
                        <CotizacionListPageLazy />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_COTIZACIONES">
                        <CotizacionCreatePageLazy />
                    </RouteProtector>
                )
            },
            {
                path: 'editar/:id',
                element: (
                    <RouteProtector requiredPermission="EDITAR_COTIZACIONES">
                        <CotizacionEditPageLazy />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_COTIZACIONES">
                        <CotizacionDetailPageLazy />
                    </RouteProtector>
                )
            }
        ]
    }
];
