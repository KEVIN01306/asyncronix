import type { RouteObject } from 'react-router-dom';
import { OpcionesServicioListPage, OpcionServicioFormPage, OpcionServicioDetailPage } from './opciones-servicio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const opcionesServicioRoutes: RouteObject[] = [
    {
        path: 'opciones-servicio',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_OPCION_SERVICIO">
                        <OpcionesServicioListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_OPCION_SERVICIO">
                        <OpcionServicioFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_OPCION_SERVICIO_DETALLE">
                        <OpcionServicioDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_OPCION_SERVICIO">
                        <OpcionServicioFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
