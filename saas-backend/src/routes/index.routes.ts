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
router.use('/categorias', (await import('../modules/categoria/presentation/categoria.routes.js')).default)
router.use('/productos', (await import('../modules/producto/presentation/producto.routes.js')).default)
router.use('/atributos', (await import('../modules/atributo/presentation/atributo.routes.js')).default)
router.use('/lotes', (await import('../modules/lote/presentation/lote.routes.js')).default)
router.use('/traslados', (await import('../modules/traslado/presentation/traslado.routes.js')).default)
router.use('/clientes', (await import('../modules/cliente/presentation/cliente.routes.js')).default)
router.use('/ventas', (await import('../modules/ventas/presentation/venta.routes.js')).default)
router.use('/cilindradas', (await import('../modules/cilindrada/presentation/cilindrada.routes.js')).default)
router.use('/lineas', (await import('../modules/linea/presentation/linea.routes.js')).default)
router.use('/marcas', (await import('../modules/marca/presentation/marca.routes.js')).default)
router.use('/modelos', (await import('../modules/modelo/presentation/modelo.routes.js')).default)
router.use('/vehiculotipos', (await import('../modules/vehiculotipo/presentation/vehiculotipo.routes.js')).default)
router.use('/vehiculos', (await import('../modules/vehiculo/presentation/vehiculo.routes.js')).default)
router.use('/opciones-servicio', (await import('../modules/opcion-servicio/presentation/opcion-servicio.routes.js')).default)
router.use('/tipos-servicio', (await import('../modules/tipo-servicio/presentation/tipo-servicio.routes.js')).default)
router.use('/checklist-items', (await import('../modules/checklist-item/presentation/checklist-item.routes.js')).default)
router.use('/servicios', (await import('../modules/servicio/presentation/servicio.routes.js')).default)
router.use('/notifications', (await import('../modules/notificacion/presentation/notificacion.routes.js')).default)
router.use('/proveedores', (await import('../modules/proveedor/presentation/proveedor.routes.js')).default)

router.use(errorMiddleware)

export default router;
