import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { servicioController } from "../servicio.module.js";
import { servicioCrearSchema, servicioActualizarSchema, servicioCambiarEstadoSchema, servicioListarQuerySchema, servicioSalidaSchema, servicioTareaCrearSchema, servicioTareaActualizarSchema, servicioObservacionesSchema, asociarMecanicoSchema, cambiarMecanicoSchema, clienteExternoSchema, repuestoClienteCrearSchema, repuestoCrearSchema } from "./validators/servicio.schema.js";
import { checklistRespuestaCrearSchema, checklistRespuestaActualizarSchema } from "./validators/checklist-respuesta.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validarMiddleware = new ValidarMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    authMiddleware.verificarPermiso(['VER_SERVICIOS']),
    validarMiddleware.validarQuery(servicioListarQuerySchema),
    servicioController.listar
);

router.get(
    "/:id",
    authMiddleware.verificarPermiso(['VER_SERVICIOS_DETALLE']),
    servicioController.obtener
);

router.get(
    "/:id/estado",
    servicioController.obtenerEstado
);

router.post(
    "/",
    authMiddleware.verificarPermiso(['CREAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioCrearSchema),
    servicioController.registrar
);

router.put(
    "/:id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioActualizarSchema),
    servicioController.actualizar
);

router.patch(
    "/:id/estado",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioCambiarEstadoSchema),
    servicioController.cambiarEstado
);

router.post(
    "/:id/listo-salida",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    servicioController.listoSalida
);

router.post(
    "/:id/salida",
    authMiddleware.verificarPermiso(['SALIDA_SERVICIOS']),
    FileUploadMiddleware.single('firma_cliente', 'servicios'),
    validarMiddleware.validarBody(servicioSalidaSchema),
    servicioController.finalizarSalida
);

router.post(
    "/:id/firma-entrada",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    FileUploadMiddleware.single('firma', 'servicios'),
    servicioController.guardarFirmaEntrada
);

router.post(
    "/:id/progreso/imagenes",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    FileUploadMiddleware.single('imagen', 'servicios'),
    servicioController.subirImagenProgreso
);

router.post(
    "/:id/imagenes",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    FileUploadMiddleware.single('imagen', 'servicios'),
    servicioController.subirImagen
);

router.delete(
    "/:id/imagenes/:imagen_id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    servicioController.eliminarImagen
);

router.put(
    "/:id/observaciones",
    authMiddleware.verificarPermisoSome(['EDITAR_SERVICIOS', 'ADMIN_SERVICIOS']),
    validarMiddleware.validarBody(servicioObservacionesSchema),
    servicioController.actualizarObservaciones
);

router.post(
    "/:id/tareas",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioTareaCrearSchema),
    servicioController.registrarTarea
);

router.put(
    "/:id/tareas/:tarea_id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioTareaActualizarSchema),
    servicioController.actualizarTarea
);

router.delete(
    "/:id/tareas/:tarea_id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    servicioController.eliminarTarea
);

router.get(
    "/:id/checklist-respuestas",
    authMiddleware.verificarPermiso(['VER_CHECKLIST']),
    servicioController.listarChecklistRespuestas
);

router.post(
    "/:id/checklist-respuestas",
    authMiddleware.verificarPermiso(['CREAR_CHECKLIST']),
    validarMiddleware.validarBody(checklistRespuestaCrearSchema),
    servicioController.registrarChecklistRespuesta
);

router.put(
    "/:id/checklist-respuestas/:respuesta_id",
    authMiddleware.verificarPermiso(['EDITAR_CHECKLIST']),
    validarMiddleware.validarBody(checklistRespuestaActualizarSchema),
    servicioController.actualizarChecklistRespuesta
);

router.delete(
    "/:id/checklist-respuestas/:respuesta_id",
    authMiddleware.verificarRol(['ELIMINAR_CHECKLIST']),
    servicioController.eliminarChecklistRespuesta
);

router.post(
    "/:id/asociar-cliente",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    servicioController.asociarCliente
);

router.put(
    "/:id/cliente-externo",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(clienteExternoSchema),
    servicioController.actualizarClienteExterno
);

router.post(
    "/:id/asociar-mecanico",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(asociarMecanicoSchema),
    servicioController.asociarMecanico
);

router.post(
    "/:id/cambiar-mecanico",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(cambiarMecanicoSchema),
    servicioController.cambiarMecanico
);

router.post(
    "/:id/repuestos-cliente",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(repuestoClienteCrearSchema),
    servicioController.registrarRepuestoCliente
);

router.delete(
    "/:servicioId/repuestos-cliente/:id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    servicioController.eliminarRepuestoCliente
);

router.post(
    "/:id/repuestos",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS','EDITAR_SERVICIOS_REPUESTOS']),
    validarMiddleware.validarBody(repuestoCrearSchema),
    servicioController.registrarRepuesto
);

router.delete(
    "/:servicioId/repuestos/:id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS','EDITAR_SERVICIOS_REPUESTOS']),
    servicioController.eliminarRepuesto
);

export default router;
