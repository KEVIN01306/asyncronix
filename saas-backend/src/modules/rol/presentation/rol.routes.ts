import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { rolController } from "../rol.module.js";
import { rolCrearSchema, rolActualizarSchema } from "./validators/rol.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";
import { z } from 'zod';

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.get('/',
    authMiddleware.verificarPermiso(['VER_ROLES']),
    validarMiddleware.validarQuery(paginacionQuerySchema.extend({ q: z.string().optional() })),
    rolController.listar
);

router.get('/:id',
    authMiddleware.verificarPermiso(['VER_ROLES_DETALLE']),
    rolController.obtener
);

router.post('/',
    authMiddleware.verificarPermiso(['CREAR_ROLES']),
    validarMiddleware.validarBody(rolCrearSchema),
    rolController.registrar
);

router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_ROLES']),
    validarMiddleware.validarBody(rolActualizarSchema),
    rolController.actualizar
);

router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_ROLES']),
    rolController.eliminar
);

export default router;
