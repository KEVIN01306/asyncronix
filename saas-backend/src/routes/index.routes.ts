import { Router } from "express";
import path from "path";
import express from "express";
import { errorMiddleware } from "@app/middlewares/ErrorMiddleware.js";

const router = Router();

router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
router.use('/auth', (await import('../modules/auth/presentation/auth.routes.js')).default)
router.use('/usuarios', (await import('../modules/usuarios/presentation/usuario.routes.js')).default)
router.use('/roles', (await import('../modules/rol/presentation/rol.routes.js')).default)
router.use('/permisos', (await import('../modules/permisos/presentation/permisos.routes.js')).default)
router.use('/sucursales', (await import('../modules/sucursal/presentation/sucursal.routes.js')).default)
router.use('/negocios', (await import('../modules/negocio/presentation/negocio.routes.js')).default)



router.use(errorMiddleware)

export default router;
