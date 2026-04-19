import { Router } from "express";
import { sucursalController } from "../sucursal.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { sucursalActualizarSchema, sucursalCrearSchema } from "./validators/sucursal.validator.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)

router.get('/',
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    sucursalController.listar
);

router.get('/:id',
    authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']),
    sucursalController.obtener
);

router.post('/',
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(sucursalCrearSchema),
    sucursalController.registrar
);

router.put('/:id',
    authMiddleware.verificarRol(['ADMIN']),
    validarMiddleware.validarBody(sucursalActualizarSchema),
    sucursalController.actualizar
);

router.delete('/:id',
    authMiddleware.verificarRol(['ADMIN']),
    sucursalController.eliminar
);

export default router
