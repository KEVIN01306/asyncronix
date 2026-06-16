import type { RouteObject } from 'react-router-dom';
import { ServiciosVehiculoListPage, ServicioVehiculoFormPage, ServicioVehiculoDetailPage, ServicioVehiculoCustomPage, ServicioVehiculoProgresoPage, ServicioVehiculoSalidaPage, ServicioVehiculoRepuestosPage, ServicioVehiculoHojaPage } from './servicio-lazy';
import { RouteProtector } from '../../../shared/components/RouteProtector';
import { ServicioStateGuard } from './components/ServicioStateGuard';
import { ESTADO_SERVICIO_VEHICULO } from '../domain/servicio.constants';

export const servicioRoutes: RouteObject[] = [
    {
        path: 'servicios-vehiculo',
        children: [
            {
                index: true,
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS">
                        <ServiciosVehiculoListPage />
                    </RouteProtector>
                )
            },
            {
                path: 'nuevo',
                element: (
                    <RouteProtector requiredPermission="CREAR_SERVICIOS">
                        <ServicioVehiculoFormPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id',
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS_DETALLE">
                        <ServicioVehiculoDetailPage />
                    </RouteProtector>
                )
            },
            {
                path: ':id/hoja',
                element: (
                    <RouteProtector requiredPermission="VER_SERVICIOS_DETALLE">
                            <ServicioStateGuard
                                requiredPermission="VER_SERVICIOS_DETALLE"
                                validStates={[ESTADO_SERVICIO_VEHICULO.FINALIZADO]}
                            >
                            <ServicioVehiculoHojaPage />
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
                            validStates={[ESTADO_SERVICIO_VEHICULO.RECEPCION, ESTADO_SERVICIO_VEHICULO.EN_SERVICIO, ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS]}
                        >
                            <ServicioVehiculoCustomPage />
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
                                ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
                                ESTADO_SERVICIO_VEHICULO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO_VEHICULO.EN_REPARACION,
                                ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
                            ]}
                        >
                            <ServicioVehiculoProgresoPage />
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
                            validStates={[ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA]}
                        >
                            <ServicioVehiculoSalidaPage />
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
                                ESTADO_SERVICIO_VEHICULO.RECEPCION,
                                ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
                                ESTADO_SERVICIO_VEHICULO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO_VEHICULO.EN_REPARACION,
                                ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
                            ]}
                        >
                            <ServicioVehiculoRepuestosPage />
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
                                ESTADO_SERVICIO_VEHICULO.RECEPCION,
                                ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
                                ESTADO_SERVICIO_VEHICULO.EN_DIAGNOSTICO,
                                ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS,
                                ESTADO_SERVICIO_VEHICULO.EN_REPARACION,
                                ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
                            ]}
                        >
                        <ServicioVehiculoFormPage />
                        </ServicioStateGuard>
                    </RouteProtector>
                )
            }
        ]
    }
];
