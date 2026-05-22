import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../../modules/auth/presentation/auth.routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { dahsboardRoutes } from "../../modules/dashboard/dashboard.routes";
import { FullPageLoader } from "../../shared/components/ui/Loaders/FullPageLoader";
import { categoriaRoutes } from "../../modules/categorias/presentation/categoria.routes";
import { productoRoutes } from "../../modules/productos/presentation/producto.routes";
import { loteRoutes } from "../../modules/lotes/presentation/lote.routes";
import BlankLayout from "../layouts/blankLayout";
import FullLayout from "../layouts/fullLayout";
import { sucursalRoutes } from "../../modules/sucursales/presentation/sucursal.routes";
import { usuarioRoutes } from "../../modules/usuarios/presentation/usuario.routes";
import { rolesRoutes } from "../../modules/roles/presentation/roles.routes";
import { negocioRoutes } from "../../modules/negocio/presentation/negocio.routes";
import { perfilRoutes } from "../../modules/perfil/presentation/perfil.routes";
import { ventasRoutes } from "../../modules/ventas/presentation/ventas.routes";
import { clientesRoutes } from "../../modules/clientes/presentation/clientes.routes";
import { AccesoDenegadoPage } from "../../shared/pages/AccesoDenegadoPage";

const appRouter = createBrowserRouter([
    {
        path: '/auth',
        element: (
            <Suspense fallback={<FullPageLoader />}>
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
                    ...productoRoutes,
                    ...loteRoutes,
                    ...sucursalRoutes,
                    ...usuarioRoutes,
                    ...rolesRoutes,
                    ...negocioRoutes,
                    ...perfilRoutes,
                    ventasRoutes,
                    ...clientesRoutes,
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