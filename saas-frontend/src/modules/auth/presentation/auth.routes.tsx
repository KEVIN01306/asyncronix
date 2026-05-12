import type { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
const LoginPage = lazy(() => import('./pages/LoginPage'));

export const authRoutes: RouteObject[] = [
    {
        path: 'login',
        element: <LoginPage />,
    },
];