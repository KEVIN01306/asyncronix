import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../../modules/auth/presentation/auth.routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { dahsboardRoutes } from "../../modules/dashboard/dashboard.routes";
import { FullPageLoader } from "../../shared/components/ui/Loaders/FullPageLoader";
import { categoriaRoutes } from "../../modules/categorias/presentation/categoria.routes";
import BlankLayout from "../layouts/blankLayout";
import FullLayout from "../layouts/fullLayout";
import { sucursalRoutes } from "../../modules/sucursales/presentation/sucursal.routes";
import { usuarioRoutes } from "../../modules/usuarios/presentation/usuario.routes";
import { rolesRoutes } from "../../modules/roles/presentation/roles.routes";
import { negocioRoutes } from "../../modules/negocio/presentation/negocio.routes";
import { AccesoDenegadoPage } from "../../shared/pages/AccesoDenegadoPage";

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
                    ...categoriaRoutes,
                    ...sucursalRoutes,
                    ...usuarioRoutes,
                    ...rolesRoutes,
                    ...negocioRoutes,
                    {
                        path: "acceso-denegado",
                        element: <AccesoDenegadoPage />
                    }
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