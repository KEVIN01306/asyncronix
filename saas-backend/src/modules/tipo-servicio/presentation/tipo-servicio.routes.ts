import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { tipoServicioController } from "../tipo-servicio.module.js";
import { tipoServicioSchema, tipoServicioActualizarSchema, tipoServicioListQuerySchema } from "./validators/tipo-servicio.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
    "/",
    authMiddleware.verificarPermiso(['CREAR_TIPO_SERVICIO']),
    validarMiddleware.validarBody(tipoServicioSchema),
    tipoServicioController.registrar
);

router.get(
    "/",
    authMiddleware.verificarPermiso(['VER_TIPO_SERVICIO']),
    validarMiddleware.validarQuery(tipoServicioListQuerySchema),
    tipoServicioController.listar
);

router.get(
    "/:id",
    authMiddleware.verificarPermiso(['VER_TIPO_SERVICIO_DETALLE']),
    tipoServicioController.obtener
);

router.put(
    "/:id",
    authMiddleware.verificarPermiso(['EDITAR_TIPO_SERVICIO']),
    validarMiddleware.validarBody(tipoServicioActualizarSchema),
    tipoServicioController.actualizar
);

router.delete(
    "/:id",
    authMiddleware.verificarRol(['ELIMINAR_TIPO_SERVICIO']),
    tipoServicioController.eliminar
);

export default router;
