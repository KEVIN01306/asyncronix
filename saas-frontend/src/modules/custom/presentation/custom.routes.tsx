import type { RouteObject } from 'react-router-dom';
import { Suspense } from 'react';
import { FullPageLoader } from '../../../shared/components/ui/Loaders/FullPageLoader';
import { CustomPage } from './pages/CustomPage';

export const customRoutes: RouteObject[] = [
    {
        path: 'custom',
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <CustomPage />
            </Suspense>
        ),
    },
];
