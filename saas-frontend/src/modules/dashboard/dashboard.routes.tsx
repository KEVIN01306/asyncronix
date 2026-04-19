import { lazy } from "react";
import type { RouteObject } from "react-router-dom";


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