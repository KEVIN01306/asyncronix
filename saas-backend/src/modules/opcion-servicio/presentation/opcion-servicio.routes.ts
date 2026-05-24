import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { opcionServicioController } from "../opcion-servicio.module.js";
import { opcionServicioSchema, opcionServicioActualizarSchema } from "./validators/opcion-servicio.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
    "/",
    authMiddleware.verificarPermiso(['CREAR_OPCION_SERVICIO']),
    validarMiddleware.validarBody(opcionServicioSchema),
    opcionServicioController.registrar
);

router.get(
    "/",
    authMiddleware.verificarPermiso(['VER_OPCION_SERVICIO']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    opcionServicioController.listar
);

router.get(
    "/:id",
    authMiddleware.verificarPermiso(['VER_OPCION_SERVICIO_DETALLE']),
    opcionServicioController.obtener
);

router.put(
    "/:id",
    authMiddleware.verificarPermiso(['EDITAR_OPCION_SERVICIO']),
    validarMiddleware.validarBody(opcionServicioActualizarSchema),
    opcionServicioController.actualizar
);

router.delete(
    "/:id",
    authMiddleware.verificarRol(['ELIMINAR_OPCION_SERVICIO']),
    opcionServicioController.eliminar
);

export default router;
