import { Router } from "express";
import path from "path";
import express from "express";
import { errorMiddleware } from "@app/middlewares/ErrorMiddleware.js";

const router = Router();

router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
router.use('/auth', (await import('../modules/auth/presentation/auth.routes.js')).default)
router.use('/usuarios', (await import('../modules/usuarios/presentation/usuario.routes.js')).default)





router.use(errorMiddleware)

export default router;
