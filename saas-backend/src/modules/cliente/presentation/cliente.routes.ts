import { Router } from "express";
import { clienteController } from "../cliente.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { clienteActualizarSchema, clienteCrearSchema } from "./validators/cliente.validator.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)
router.use(authMiddleware.verificarRol(['ADMIN', 'VENDEDOR']))

router.get('/',
    validarMiddleware.validarQuery(paginacionQuerySchema),
    clienteController.listar
);

router.get('/:id',
    clienteController.obtener
);

router.post('/',
    validarMiddleware.validarBody(clienteCrearSchema),
    clienteController.registrar
);

router.put('/:id',
    validarMiddleware.validarBody(clienteActualizarSchema),
    clienteController.actualizar
);

router.delete('/:id',
    clienteController.eliminar
);

export default router
