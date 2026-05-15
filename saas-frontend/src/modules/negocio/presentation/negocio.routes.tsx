import type { RouteObject } from 'react-router-dom';
import { NegocioDetailPage, NegocioEditPage } from './negocio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';

export const negocioRoutes: RouteObject[] = [
    {
        path: 'negocio',
        children: [ 
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_NEGOCIOS_DETALLE_ME">
                        <NegocioDetailPage />
                    </RouteProtector> 
                )
            },
            {
                path: 'editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_NEGOCIOS">
                        <NegocioEditPage />
                    </RouteProtector> 
                )
            }

        ] 
    },
];