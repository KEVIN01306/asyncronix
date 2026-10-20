import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import {
    FacturasEmitidasPageLazy,
    ResumenFiscalPageLazy,
    FacturacionConfiguracionPageLazy,
    FacturacionConfiguracionEditPageLazy
} from './facturacion.lazy';

export const facturacionRoutes: RouteObject[] = [
    {
        path: 'facturacion',
        children: [
            {
                index: true,
                element: <Navigate to="facturas" replace />
            },
            {
                path: 'facturas',
                element: (
                    <RouteProtector requiredPermission="VER_FACTURAS">
                        <FacturasEmitidasPageLazy />
                    </RouteProtector>
                )
            },
            {
                path: 'resumen',
                element: (
                    <RouteProtector requiredPermission="VER_RESUMEN_FISCAL">
                        <ResumenFiscalPageLazy />
                    </RouteProtector>
                )
            },
            {
                path: 'configuracion',
                element: (
                    <RouteProtector requiredPermission="VER_CONFIGURACION_FISCAL">
                        <FacturacionConfiguracionPageLazy />
                    </RouteProtector>
                )
            },
            {
                path: 'configuracion/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_CONFIGURACION_FISCAL">
                        <FacturacionConfiguracionEditPageLazy />
                    </RouteProtector>
                )
            }
        ]
    }
];
