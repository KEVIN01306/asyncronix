import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../../modules/auth/presentation/auth.routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { dahsboardRoutes } from "../../modules/dashboard/dashboard.routes";
import { proveedorRoutes } from "../../modules/proveedores/presentation/proveedor.routes";
import { FullPageLoader } from "../../shared/components/ui/Loaders/FullPageLoader";
import { categoriaRoutes } from "../../modules/categorias/presentation/categoria.routes";
import BlankLayout from "../layouts/blankLayout";
import FullLayout from "../layouts/fullLayout";
import { sucursalRoutes } from "../../modules/sucursales/presentation/sucursal.routes";
import { usuarioRoutes } from "../../modules/usuarios/presentation/usuario.routes";

const appRouter = createBrowserRouter([
    {
        path: '/auth',
        element: (
            <Suspense fallback={ <FullPageLoader />}>
                <BlankLayout />
            </Suspense>
        ),
        children: [
            ...authRoutes
        ]
    },
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                element: <Suspense fallback={<FullPageLoader />}>
                            <FullLayout />
                        </Suspense>,
                children: [
                    ...dahsboardRoutes,
                    ...proveedorRoutes,
                    ...categoriaRoutes,
                    ...sucursalRoutes,
                    ...usuarioRoutes,
                ]
                
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to={'/'} replace />
    }
])

export default appRouter;