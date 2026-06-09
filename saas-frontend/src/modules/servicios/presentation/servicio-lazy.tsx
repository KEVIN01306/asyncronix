import { lazy } from 'react';

export const ServiciosListPage = lazy(() => import('./pages/ServiciosListPage'));
export const ServicioFormPage = lazy(() => import('./pages/ServicioFormPage'));
export const ServicioDetailPage = lazy(() => import('./pages/ServicioHojaPage.tsx'));
export const ServicioCustomPage = lazy(() => import('./pages/ServicioCustomPage'));
export const ServicioProgresoPage = lazy(() => import('./pages/ServicioProgresoPage.tsx'));
export const ServicioSalidaPage = lazy(() => import('./pages/ServicioSalidaPage.tsx'));
export const ServicioRepuestosPage = lazy(() => import('./pages/ServicioRepuestosPage'));
