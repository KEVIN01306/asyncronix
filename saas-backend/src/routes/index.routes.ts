import { Router } from "express";
import path from "path";
import express from "express";
import { errorMiddleware } from "@app/middlewares/ErrorMiddleware.js";

const router = Router();

router.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
router.use('/auth', (await import('../modules/auth/presentation/auth.routes.js')).default)
router.use('/usuarios', (await import('../modules/usuarios/presentation/usuario.routes.js')).default)
router.use('/negocios', (await import('../modules/negocio/presentation/negocio.routes.js')).default)
router.use('/sucursales', (await import('../modules/sucursal/presentation/sucursal.routes.js')).default)
router.use('/clientes', (await import('../modules/cliente/presentation/cliente.routes.js')).default)
router.use('/proveedores', (await import('../modules/proveedor/presentation/proveedor.routes.js')).default)
router.use('/gastos', (await import('../modules/gasto/presentation/gasto.routes.js')).default)
router.use('/categorias', (await import('../modules/categoria/presentation/categoria.routes.js')).default)
router.use('/productos', (await import('../modules/producto/presentation/producto.routes.js')).default)




router.use(errorMiddleware)

export default router;
