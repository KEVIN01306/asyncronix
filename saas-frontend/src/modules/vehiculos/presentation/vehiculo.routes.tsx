import type { RouteObject } from 'react-router-dom';
import { VehiculosListPage, VehiculoFormPage, VehiculoDetailPage } from './vehiculo-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const vehiculoRoutes: RouteObject[] = [
    {
        path: 'vehiculos',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_VEHICULOS">
                        <VehiculosListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_VEHICULOS">
                        <VehiculoFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_VEHICULOS_DETALLE">
                        <VehiculoDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_VEHICULOS">
                        <VehiculoFormPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
