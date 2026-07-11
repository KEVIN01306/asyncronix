import type { RouteObject } from 'react-router-dom';
import { CuentaBancariaListPage, CuentaBancariaDetailPage, CuentaBancariaFormPage } from './cuenta-bancaria.lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import HistorialEntidadPage from './pages/CuentaBancariaHistorialPage';

export const cuentasBancariasRoutes: RouteObject[] = [
    {
        path: 'cuentas-bancarias',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_CUENTA_BANCARIA">
                        <CuentaBancariaListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_CUENTA_BANCARIA">
                        <CuentaBancariaFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_CUENTA_BANCARIA">
                        <CuentaBancariaDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CUENTA_BANCARIA">
                        <CuentaBancariaFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/historial',
                element: (
                    <RouteProtector requiredPermission="VER_CUENTA_BANCARIA">
                        <HistorialEntidadPage />
                    </RouteProtector>
                )
            }
        ]
    }
];
