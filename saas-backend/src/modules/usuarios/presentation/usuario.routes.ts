import { Router } from "express";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";
import { usuarioController } from "../usuario.module.js";
import { usuariosCrearSchema } from "./validators/usuario.schema.js";
import { usuarioActualizarSchema, actualizarPerfilSchema, cambiarPasswordSchema } from "./validators/usuario.schema.js";
import { FileUploadMiddleware } from "@shared/presentation/middlewares/upload.middleware.js";
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

router.get('/me', usuarioController.obtenerPerfil)

router.patch('/me/avatar',
    FileUploadMiddleware.single('avatar', 'avatares'),
    usuarioController.actualizarAvatar
)

router.patch('/me/password',
    validarMiddleware.validarBody(cambiarPasswordSchema),
    usuarioController.cambiarPassword
)

router.patch('/me',
    validarMiddleware.validarBody(actualizarPerfilSchema),
    usuarioController.actualizarPerfil
)


router.get('/:id',
    authMiddleware.verificarPermiso(['VER_USUARIOS_DETALLE']),
    usuarioController.obtener
)

router.patch('/:id/restablecer-contrasena',
    authMiddleware.verificarPermiso(['ADMIN_USUARIOS']),
    validarMiddleware.validarBody(cambiarPasswordSchema),
    usuarioController.restablecerPasswordUsuario
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