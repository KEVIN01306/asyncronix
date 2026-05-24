import { Router } from "express";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { checklistItemController } from "../checklist-item.module.js";
import { checklistItemSchema, checklistItemActualizarSchema } from "./validators/checklist-item.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
    "/",
    authMiddleware.verificarPermiso(['CREAR_CHECKLIST']),
    validarMiddleware.validarBody(checklistItemSchema),
    checklistItemController.registrar
);

router.get(
    "/",
    authMiddleware.verificarPermiso(['VER_CHECKLIST']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    checklistItemController.listar
);

router.get(
    "/:id",
    authMiddleware.verificarPermiso(['VER_CHECKLIST_DETALLE']),
    checklistItemController.obtener
);

router.put(
    "/:id",
    authMiddleware.verificarPermiso(['EDITAR_CHECKLIST']),
    validarMiddleware.validarBody(checklistItemActualizarSchema),
    checklistItemController.actualizar
);

router.delete(
    "/:id",
    authMiddleware.verificarRol(['ELIMINAR_CHECKLIST']),
    checklistItemController.eliminar
);

export default router;
