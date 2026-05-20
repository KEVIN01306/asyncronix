import { lazy } from 'react';

export const VentasLazy = lazy(() => import('./pages/VentaListPage'));
export const VentaFormLazy = lazy(() => import('./pages/VentaFormPage'));
export const VentaDetalleLazy = lazy(() => import('./pages/VentaDetallePage'));
