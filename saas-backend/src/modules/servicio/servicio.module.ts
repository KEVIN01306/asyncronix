import prisma from '@infrastructure/config/prisma.js';
import { PrismaServicioRepository } from './infrastructure/prisma-servicio.repository.js';
import { ObtenerServiciosUseCase } from './application/obtener-servicios.usecase.js';
import { ObtenerServicioUseCase } from './application/obtener-servicio.usecase.js';
import { RegistrarServicioUseCase } from './application/registrar-servicio.usecase.js';
import { ActualizarServicioUseCase } from './application/actualizar-servicio.usecase.js';
import { CambiarEstadoServicioUseCase } from './application/cambiar-estado-servicio.usecase.js';
import { GuardarFirmaEntradaUseCase } from './application/guardar-firma-entrada.usecase.js';
import { SubirImagenServicioUseCase } from './application/subir-imagen-servicio.usecase.js';
import { SubirImagenProgresoServicioUseCase } from './application/subir-imagen-progreso-servicio.usecase.js';
import { EliminarImagenServicioUseCase } from './application/eliminar-imagen-servicio.usecase.js';
import { ListarChecklistRespuestasUseCase } from './application/listar-checklist-respuestas.usecase.js';
import { RegistrarChecklistRespuestaUseCase } from './application/registrar-checklist-respuesta.usecase.js';
import { ActualizarChecklistRespuestaUseCase } from './application/actualizar-checklist-respuesta.usecase.js';
import { EliminarChecklistRespuestaUseCase } from './application/eliminar-checklist-respuesta.usecase.js';
import { ActualizarServicioTareaUseCase } from './application/actualizar-servicio-tarea.usecase.js';
import { AsociarClienteServicioUseCase } from './application/asociar-cliente-servicio.usecase.js';
import { ActualizarClienteExternoServicioUseCase } from './application/actualizar-cliente-externo-servicio.usecase.js';
import { AsociarMecanicoServicioUseCase } from './application/asociar-mecanico-servicio.usecase.js';
import { CambiarMecanicoServicioUseCase } from './application/cambiar-mecanico-servicio.usecase.js';
import { RegistrarRepuestoClienteUseCase } from './application/registrar-repuesto-cliente.usecase.js';
import { EliminarRepuestoClienteUseCase } from './application/eliminar-repuesto-cliente.usecase.js';
import { CrearServicioRepuestoUseCase } from './application/crear-repuesto-servicio.usecase.js';
import { EliminarServicioRepuestoUseCase } from './application/eliminar-repuesto-servicio.usecase.js';
import { ActualizarObservacionesServicioUseCase } from './application/actualizar-observaciones-servicio.usecase.js';
import { ServicioController } from './presentation/servicio.controller.js';
import { enviarNotificacionUseCase } from '../notificacion/notificacion.module.js';
import { PrismaLoteRepository } from '../lote/infrastructure/prisma-lote.repository.js';
import { PrismaProductoRepository } from '../producto/infrastructure/prisma-producto.repository.js';

const repository = new PrismaServicioRepository(prisma as any);
const obtenerServiciosUseCase = new ObtenerServiciosUseCase(repository);
const obtenerServicioUseCase = new ObtenerServicioUseCase(repository);
const registrarServicioUseCase = new RegistrarServicioUseCase(repository);
const actualizarServicioUseCase = new ActualizarServicioUseCase(repository);
const cambiarEstadoServicioUseCase = new CambiarEstadoServicioUseCase(repository);
const guardarFirmaEntradaUseCase = new GuardarFirmaEntradaUseCase(repository);
const subirImagenServicioUseCase = new SubirImagenServicioUseCase(repository);
const subirImagenProgresoServicioUseCase = new SubirImagenProgresoServicioUseCase(repository);
const eliminarImagenServicioUseCase = new EliminarImagenServicioUseCase(repository);
const listarChecklistRespuestasUseCase = new ListarChecklistRespuestasUseCase(repository);
const registrarChecklistRespuestaUseCase = new RegistrarChecklistRespuestaUseCase(repository);
const actualizarChecklistRespuestaUseCase = new ActualizarChecklistRespuestaUseCase(repository);
const eliminarChecklistRespuestaUseCase = new EliminarChecklistRespuestaUseCase(repository);
const actualizarTareaUseCase = new ActualizarServicioTareaUseCase(repository);
const asociarClienteServicioUseCase = new AsociarClienteServicioUseCase(repository);
const actualizarClienteExternoServicioUseCase = new ActualizarClienteExternoServicioUseCase(repository);
const asociarMecanicoServicioUseCase = new AsociarMecanicoServicioUseCase(repository, enviarNotificacionUseCase);
const cambiarMecanicoServicioUseCase = new CambiarMecanicoServicioUseCase(repository, enviarNotificacionUseCase);
const registrarRepuestoClienteUseCase = new RegistrarRepuestoClienteUseCase(repository);
const eliminarRepuestoClienteUseCase = new EliminarRepuestoClienteUseCase(repository);
const loteRepository = new PrismaLoteRepository(prisma as any);
const productoRepository = new PrismaProductoRepository(prisma as any);
const crearServicioRepuestoUseCase = new CrearServicioRepuestoUseCase(repository, loteRepository, productoRepository);
const eliminarServicioRepuestoUseCase = new EliminarServicioRepuestoUseCase(repository);
const actualizarObservacionesServicioUseCase = new ActualizarObservacionesServicioUseCase(repository);

export const servicioController = new ServicioController(
    obtenerServiciosUseCase,
    obtenerServicioUseCase,
    registrarServicioUseCase,
    actualizarServicioUseCase,
    cambiarEstadoServicioUseCase,
    guardarFirmaEntradaUseCase,
    subirImagenServicioUseCase,
    subirImagenProgresoServicioUseCase,
    eliminarImagenServicioUseCase,
    listarChecklistRespuestasUseCase,
    registrarChecklistRespuestaUseCase,
    actualizarChecklistRespuestaUseCase,
    eliminarChecklistRespuestaUseCase,
    actualizarTareaUseCase,
    asociarClienteServicioUseCase,
    actualizarClienteExternoServicioUseCase,
    asociarMecanicoServicioUseCase,
    cambiarMecanicoServicioUseCase
    , registrarRepuestoClienteUseCase, eliminarRepuestoClienteUseCase, crearServicioRepuestoUseCase, eliminarServicioRepuestoUseCase, actualizarObservacionesServicioUseCase
);
