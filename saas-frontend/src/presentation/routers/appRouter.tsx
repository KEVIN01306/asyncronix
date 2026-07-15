import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../../modules/auth/presentation/auth.routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { dahsboardRoutes } from "../../modules/dashboard/dashboard.routes";
import { FullPageLoader } from "../../shared/components/ui/Loaders/FullPageLoader";
import { categoriaRoutes } from "../../modules/categorias/presentation/categoria.routes";
import { productoRoutes } from "../../modules/productos/presentation/producto.routes";
import { loteRoutes } from "../../modules/lotes/presentation/lote.routes";
import { lineasRoutes } from "../../modules/lineas/presentation/lineas.routes";
import { marcasRoutes } from "../../modules/marcas/presentation/marcas.routes";
import { modelosRoutes } from "../../modules/modelos/presentation/modelos.routes";
import { cilindradasRoutes } from "../../modules/cilindradas/presentation/cilindradas.routes";
import { vehiculoRoutes } from "../../modules/vehiculos/presentation/vehiculo.routes";
import { opcionesServicioRoutes } from "../../modules/opciones-servicio/presentation/opciones-servicio.routes";
import { tiposServicioRoutes } from "../../modules/tipos-servicio/presentation/tipos-servicio.routes";
import { servicioRoutes } from "../../modules/serviciosVehiculos/presentation/servicio.routes";
import { checklistItemsRoutes } from "../../modules/checklist-items/presentation/checklist-items.routes";
import BlankLayout from "../layouts/blankLayout";
import FullLayout from "../layouts/fullLayout";
import { sucursalRoutes } from "../../modules/sucursales/presentation/sucursal.routes";
import { usuarioRoutes } from "../../modules/usuarios/presentation/usuario.routes";
import { rolesRoutes } from "../../modules/roles/presentation/roles.routes";
import { negocioRoutes } from "../../modules/negocio/presentation/negocio.routes";
import { perfilRoutes } from "../../modules/perfil/presentation/perfil.routes";
import { ventasRoutes } from "../../modules/ventas/presentation/ventas.routes";
import { trasladosRoutes } from "../../modules/traslados/presentation/traslado.routes";
import { clientesRoutes } from "../../modules/clientes/presentation/clientes.routes";
import { proveedoresRoutes } from "../../modules/proveedores/presentation/proveedores.routes";
import { customRoutes } from "../../modules/custom/presentation/custom.routes";
import { paisesRoutes } from "../../modules/paises/presentation/paises.routes";
import { monedasRoutes } from "../../modules/monedas/presentation/monedas.routes";
import { cajaRoutes } from "../../modules/caja/presentation/caja.routes";
import { cuentasBancariasRoutes } from "../../modules/cuenta-bancaria/presentation/cuenta-bancaria.routes";
import { categoriasTransaccionRoutes } from "../../modules/categorias-transaccion/presentation/categorias-transaccion.routes";
import { AccesoDenegadoPage } from "../../shared/pages/AccesoDenegadoPage";
import { ingresoEgresoRoutes } from "../../modules/ingresos-egresos/presentation/ingresoEgreso.routes";
import { reportesRoutes } from "../../modules/reportes/presentation/reportes.routes";
import { movimientosInternosRoutes } from "../../modules/movimientos-internos/presentation/movimientos-internos.routes";

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
        element: (
            <Suspense fallback={<FullPageLoader />}>
                <ProtectedRoute />
            </Suspense>
        ),
        children: [
            {
                element:
                    <Suspense fallback={<FullPageLoader />}>
                        <FullLayout />
                    </Suspense>,
                children: [
                    ...dahsboardRoutes,
                    ...categoriaRoutes,
                    ...cilindradasRoutes,
                    ...lineasRoutes,
                    ...marcasRoutes,
                    ...modelosRoutes,
                    ...vehiculoRoutes,
                    ...servicioRoutes,
                    ...opcionesServicioRoutes,
                    ...tiposServicioRoutes,
                    ...checklistItemsRoutes,
                    ...productoRoutes,
                    ...loteRoutes,
                    ...sucursalRoutes,
                    ...usuarioRoutes,
                    ...rolesRoutes,
                    ...negocioRoutes,
                    ...perfilRoutes,
                    ventasRoutes,
                    trasladosRoutes,
                    ...clientesRoutes,
                    ...proveedoresRoutes,
                    ...cajaRoutes,
                    ...cuentasBancariasRoutes,
                    ...categoriasTransaccionRoutes,
                    ...ingresoEgresoRoutes,
                    ...movimientosInternosRoutes,
                    ...reportesRoutes,
                    ...customRoutes,
                    ...paisesRoutes,
                    ...monedasRoutes,
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