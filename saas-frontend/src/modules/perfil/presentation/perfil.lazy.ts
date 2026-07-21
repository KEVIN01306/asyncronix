import { lazy } from 'react';

export const PerfilPage = lazy(() => import('./pages/PerfilPage').then(module => ({ default: module.PerfilPage })));
export const VerificarCorreoPage = lazy(() => import('./pages/VerificarCorreoPage').then(module => ({ default: module.VerificarCorreoPage })));
export const CorreoVerificadoPage = lazy(() => import('./pages/CorreoVerificadoPage').then(module => ({ default: module.CorreoVerificadoPage })));
