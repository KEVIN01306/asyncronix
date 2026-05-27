import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
import { servicioController } from "../servicio.module.js";
import { servicioCrearSchema, servicioActualizarSchema, servicioCambiarEstadoSchema, servicioListarQuerySchema, servicioTareaActualizarSchema, asociarMecanicoSchema, cambiarMecanicoSchema } from "./validators/servicio.schema.js";
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
    "/:id/tareas/:tarea_id",
    authMiddleware.verificarPermiso(['EDITAR_SERVICIOS']),
    validarMiddleware.validarBody(servicioTareaActualizarSchema),
    servicioController.actualizarTarea
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

export default router;
