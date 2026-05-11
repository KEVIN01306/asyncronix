import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { usuarioController } from "../usuario.module.js";
import { usuariosCrearSchema } from "./validators/usuario.schema.js";
import { usuarioActualizarSchema } from "./validators/usuario.schema.js";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const router = Router()

const validarMiddleware = new ValidarMiddleware()
const authMiddleware = new AuthMiddleware()

router.use(authMiddleware.protegerRuta)

router.get('/',
    authMiddleware.verificarPermiso(['VER_USUARIOS']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    usuarioController.listar
)


router.get('/:id',
    authMiddleware.verificarPermiso(['VER_USUARIOS_DETALLE']),
    usuarioController.obtener
)

router.post('/',
    authMiddleware.verificarPermiso(['CREAR_USUARIOS']),
    validarMiddleware.validarBody(usuariosCrearSchema),
    usuarioController.registrar
)

router.put('/:id',
    authMiddleware.verificarPermiso(['EDITAR_USUARIOS']),
    validarMiddleware.validarBody(usuarioActualizarSchema),
    usuarioController.actualizar
)

router.delete('/:id',
    authMiddleware.verificarPermiso(['ELIMINAR_USUARIOS']),
    usuarioController.eliminar
)

export default router;