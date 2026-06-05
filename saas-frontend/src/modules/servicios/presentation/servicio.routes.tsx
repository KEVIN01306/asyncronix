import type { RouteObject } from 'react-router-dom';
import { ServiciosListPage, ServicioFormPage, ServicioDetailPage, ServicioCustomPage, ServicioProgresoPage, ServicioSalidaPage, ServicioRepuestosPage } from './servicio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import { ServicioStateGuard } from './components/ServicioStateGuard';
import { ESTADO_SERVICIO } from '../domain/servicio.constants';
import ServicioHojaPage from './pages/ServicioHojaPage';

export const servicioRoutes: RouteObject[] = [
    {
        path: 'servicios',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS">
                        <ServiciosListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_SERVICIOS">
                        <ServicioFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS_DETALLE">
                        <ServicioDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/hoja',
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS_DETALLE">
                            <ServicioStateGuard
                                requiredPermission="VER_SERVICIOS_DETALLE"
                                validStates={[ESTADO_SERVICIO.FINALIZADO]}
                            >
                            <ServicioHojaPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            },
            {
                path: ':id/configuracion',
                element: (
                    <RouteProtector requiredPermission="CONFIGURACION_SERVICIOS">
                        <ServicioStateGuard
                            requiredPermission="CONFIGURACION_SERVICIOS"
                            validStates={[ESTADO_SERVICIO.RECEPCION, ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_PRUEBAS]}
                        >
                            <ServicioCustomPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            },
            {
                path: ':id/progreso',
                element: (
                    <RouteProtector requiredPermission="PROGRESO_SERVICIOS">
                        <ServicioStateGuard
                            requiredPermission="PROGRESO_SERVICIOS"
                            validStates={[
                                ESTADO_SERVICIO.EN_SERVICIO,
                                ESTADO_SERVICIO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO.EN_REPARACION,
                                ESTADO_SERVICIO.EN_PRUEBAS
                            ]}
                        >
                            <ServicioProgresoPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            },
            {
                path: ':id/salida',
                element: (
                    <RouteProtector requiredPermission="SALIDA_SERVICIOS">
                        <ServicioStateGuard
                            requiredPermission="SALIDA_SERVICIOS"
                            validStates={[ESTADO_SERVICIO.LISTO_ENTREGA]}
                        >
                            <ServicioSalidaPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            },
            {
                path: ':id/repuestos',
                element: (
                    <RouteProtector requiredPermission={["CONFIGURACION_SERVICIOS", "EDITAR_SERVICIOS_REPUESTOS"]}>
                        <ServicioStateGuard
                            requiredPermission="CONFIGURACION_SERVICIOS"
                            validStates={[
                                ESTADO_SERVICIO.RECEPCION,
                                ESTADO_SERVICIO.EN_SERVICIO,
                                ESTADO_SERVICIO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO.EN_REPARACION,
                                ESTADO_SERVICIO.EN_PRUEBAS
                            ]}
                        >
                            <ServicioRepuestosPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            },
            {
                path: ':id/editar',
                element: (
                    <RouteProtector requiredPermission="EDITAR_SERVICIOS">
                        <ServicioStateGuard
                            requiredPermission="CONFIGURACION_SERVICIOS"
                            validStates={[
                                ESTADO_SERVICIO.RECEPCION,
                                ESTADO_SERVICIO.EN_SERVICIO,
                                ESTADO_SERVICIO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO.EN_REPARACION,
                                ESTADO_SERVICIO.EN_PRUEBAS
                            ]}
                        >
                        <ServicioFormPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            }
        ]
    }
];
