import { lazy } from 'react';

export const ProductosListPage = lazy(() => import('./pages/ProductosListPage'));
export const ProductoFormPage = lazy(() => import('./pages/ProductoFormPage'));
export const ProductoDetailPage = lazy(() => import('./pages/ProductoDetailPage'));
export const BuscarProductosPage = lazy(() => import('./pages/BuscarProductosPage'));