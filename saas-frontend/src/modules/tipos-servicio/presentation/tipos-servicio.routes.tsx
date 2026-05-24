import type { RouteObject } from 'react-router-dom';
import { TiposServicioListPage, TipoServicioFormPage, TipoServicioDetailPage } from './tipos-servicio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const tiposServicioRoutes: RouteObject[] = [
    {
        path: 'tipos-servicio',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_TIPO_SERVICIO">
                        <TiposServicioListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_TIPO_SERVICIO">
                        <TipoServicioFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_TIPO_SERVICIO_DETALLE">
                        <TipoServicioDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_TIPO_SERVICIO">
                        <TipoServicioFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
