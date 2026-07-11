import type { RouteObject } from 'react-router-dom';
import { CajaListPage, CajaFormPage, CajaDetailPage } from './caja.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import HistorialEntidadPage from './pages/CajaHistorialPage';

export const cajaRoutes: RouteObject[] = [
    {
        path: 'cajas',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CAJAS">
                        <CajaListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_CAJAS">
                        <CajaFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_CAJAS_DETALLE">
                        <CajaDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CAJAS">
                        <CajaFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/historial',
                element: (
                    <RouteProtector requiredPermission="VER_CAJAS">
                        <HistorialEntidadPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
