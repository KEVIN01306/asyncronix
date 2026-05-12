import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// eslint-disable-next-line react-refresh/only-export-components
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

export const dahsboardRoutes: RouteObject[] = [
    {
        path: "/",
        children: [
            {
                index: true,
                element: (
                    <DashboardPage />
                )
            }
        ]
    }
]