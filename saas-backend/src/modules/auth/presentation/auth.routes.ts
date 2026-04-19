import { Router } from "express";
import { authController } from "../auth.module.js";
import { ValidarMiddleware } from "@app/middlewares/ValidarMiddleware.js";
import { loginSchema } from "./validators/login.schema.js";
import { AuthMiddleware } from "@app/middlewares/AuthMiddleware.js";

const validarMiddleware = new ValidarMiddleware()
const authMiddleware = new AuthMiddleware();

const router = Router();

router.post('/login',
    validarMiddleware.validarBody(loginSchema),
    authController.login)

router.post('/refresh',
    authController.refresh
)

router.get('/me',
    authMiddleware.protegerRuta,
    authController.obtenerPerfil
)

export default router;