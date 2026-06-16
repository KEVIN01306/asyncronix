import { Router } from "express";
import { sucursalController } from "../sucursal.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { sucursalActualizarSchema, sucursalCrearSchema } from "./validators/sucursal.validator.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";
import { z } from 'zod';

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)

router.get('/',
    authMiddleware.verificarPermiso(['VER_SUCURSALES']),
    validarMiddleware.validarQuery(paginacionQuerySchema.extend({ q: z.string().optional() })),
    sucursalController.listar
);

router.get('/:id',
    authMiddleware.verificarPermiso(['VER_SUCURSALES_DETALLE']),
    sucursalController.obtener
);

router.post('/',
    authMiddleware.verificarPermiso(['CREAR_SUCURSALES']),
    validarMiddleware.validarBody(sucursalCrearSchema),
    sucursalController.registrar
);

router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_SUCURSALES']),
    validarMiddleware.validarBody(sucursalActualizarSchema),
    sucursalController.actualizar
);

router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_SUCURSALES']),
    sucursalController.eliminar
);

export default router
