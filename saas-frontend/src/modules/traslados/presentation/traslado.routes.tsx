import type { RouteObject } from 'react-router-dom';
import { TrasladosSalidaLazy, TrasladosEntradaLazy, TrasladoFormLazy, TrasladoDetalleLazy } from './traslado.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const trasladosRoutes: RouteObject = {
    path: 'traslados',
    children: [
        {
            index: true,
            element: (
                <RouteProtector requiredPermission="VER_TRASLADO">
                    <TrasladosSalidaLazy />
                </RouteProtector>
            )
        },
        {
            path: 'salidas',
            element: (
                <RouteProtector requiredPermission="VER_TRASLADO">
                    <TrasladosSalidaLazy />
                </RouteProtector>
            )
        },
        {
            path: 'entradas',
            element: (
                <RouteProtector requiredPermission="VER_TRASLADO">
                    <TrasladosEntradaLazy />
                </RouteProtector>
            )
        },
        {
            path: 'nuevo',
            element: (
                <RouteProtector requiredPermission="CREAR_TRASLADO">
                    <TrasladoFormLazy />
                </RouteProtector>
            )
        },
        {
            path: ':id',
            element: (
                <RouteProtector requiredPermission="VER_TRASLADO_DETALLE">
                    <TrasladoDetalleLazy />
                </RouteProtector>
            )
        }
    ]
};
