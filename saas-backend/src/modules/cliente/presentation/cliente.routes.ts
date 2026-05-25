import { Router } from "express";
import { clienteController } from "../cliente.module.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { clienteActualizarSchema, clienteBuscarSchema, clienteCrearSchema } from "./validators/cliente.validator.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router()

const authMiddleware = new AuthMiddleware()
const validarMiddleware = new ValidarMiddleware()

router.use(authMiddleware.protegerRuta)

router.get('/buscar',
    authMiddleware.verificarPermiso(['VER_CLIENTES']),
    validarMiddleware.validarQuery(clienteBuscarSchema),
    clienteController.buscarPorDocumento
);

router.get('/nit/:nit',
    authMiddleware.verificarPermiso(['VER_CLIENTES']),
    clienteController.buscarPorNit
);

router.get('/',
    authMiddleware.verificarPermiso(['VER_CLIENTES']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    clienteController.listar
);

router.get('/:id',
    authMiddleware.verificarPermiso(['VER_CLIENTES_DETALLE']),
    clienteController.obtener
);

router.post('/',
    authMiddleware.verificarPermiso(['CREAR_CLIENTES']),
    validarMiddleware.validarBody(clienteCrearSchema),
    clienteController.registrar
);

router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_CLIENTES']),
    validarMiddleware.validarBody(clienteActualizarSchema),
    clienteController.actualizar
);

router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_CLIENTES']),
    clienteController.eliminar
);

export default router
