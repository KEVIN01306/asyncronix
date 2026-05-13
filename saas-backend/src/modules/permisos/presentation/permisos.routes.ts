import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { permisosController } from "../permisos.module.js";
import { permisosRolSchema } from "./validators/permisos.schema.js";

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.get('/modulos',
    authMiddleware.verificarPermiso(['VER_PERMISOS']),
    permisosController.listarModulos
);

router.get('/',
    authMiddleware.verificarPermiso(['VER_PERMISOS']),
    permisosController.listarPermisos
);

router.get('/roles/:id',
    authMiddleware.verificarPermiso(['VER_PERMISOS']),
    permisosController.listarPermisosRol
);

router.put('/roles/:id',
    authMiddleware.verificarPermiso(['ASIGNAR_PERMISOS_ROL','EDITAR_PERMISOS']),
    validarMiddleware.validarBody(permisosRolSchema),
    permisosController.asignarPermisosRol
);

export default router;
