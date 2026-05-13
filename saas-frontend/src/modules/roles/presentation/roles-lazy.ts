import { lazy } from 'react';

export const RolesListPage = lazy(() => import('./pages/RolesListPage'));
export const RolesDetailPage = lazy(() => import('./pages/RolesDetailPage'));
export const RolePermissionsPage = lazy(() => import('./pages/RolePermissionsPage'));
export const RolesCreatePage = lazy(() => import('./pages/RolesCreatePage'));
export const RolesEditPage = lazy(() => import('./pages/RolesEditPage'));
