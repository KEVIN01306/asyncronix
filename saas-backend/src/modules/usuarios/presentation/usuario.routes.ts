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
router.use(authMiddleware.verificarRol(['ADMIN']))

router.get('/',
    validarMiddleware.validarQuery(paginacionQuerySchema),
    usuarioController.listar
)


router.get('/:id',
    usuarioController.obtener
)

router.post('/',
    validarMiddleware.validarBody(usuariosCrearSchema),
    usuarioController.registrar
)

router.put('/:id',
    validarMiddleware.validarBody(usuarioActualizarSchema),
    usuarioController.actualizar
)

router.delete('/:id',
    usuarioController.eliminar
)

export default router;