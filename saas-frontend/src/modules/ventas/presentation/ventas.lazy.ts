import { lazy } from 'react';

export const VentasLazy = lazy(() => import('./pages/VentasPage'));
export const VentaFormLazy = lazy(() => import('./pages/VentaFormPage'));
export const VentaDetalleLazy = lazy(() => import('./pages/VentaDetallePage'));
