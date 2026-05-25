import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { FileUploadMiddleware } from '@shared/presentation/middlewares/upload.middleware.js';
import { vehiculoController } from '../vehiculo.module.js';
import { vehiculoCrearSchema, vehiculoActualizarSchema, vehiculoListQuerySchema, vehiculoAsociarClienteSchema, vehiculoCrearClienteSchema } from './validators/vehiculo.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get('/', auth.verificarPermiso(['VER_VEHICULOS']), validar.validarQuery(vehiculoListQuerySchema), vehiculoController.listar);
router.get('/placa/:placa', auth.verificarPermiso(['VER_VEHICULOS_DETALLE']), vehiculoController.obtenerPorPlaca);
router.get('/:id', auth.verificarPermiso(['VER_VEHICULOS_DETALLE']), vehiculoController.obtener);
router.post('/', auth.verificarPermiso(['CREAR_VEHICULOS']), validar.validarBody(vehiculoCrearSchema), vehiculoController.registrar);
router.put('/:id', auth.verificarPermiso(['EDITAR_VEHICULOS']), validar.validarBody(vehiculoActualizarSchema), vehiculoController.actualizar);

router.put('/:id/asociar-cliente', auth.verificarPermiso(['EDITAR_VEHICULOS']), validar.validarBody(vehiculoAsociarClienteSchema), vehiculoController.asociarCliente);

router.post('/:id/crear-asociar-cliente', auth.verificarPermiso(['CREAR_CLIENTES','EDITAR_VEHICULOS']), validar.validarBody(vehiculoCrearClienteSchema), vehiculoController.crearYAsociarCliente);

router.post('/:id/avatar', auth.verificarPermiso(['EDITAR_VEHICULOS']), FileUploadMiddleware.single('avatar', 'vehiculos'), vehiculoController.subirAvatar);
router.post('/:id/calcomania', auth.verificarPermiso(['EDITAR_VEHICULOS']), FileUploadMiddleware.single('file', 'vehiculos'), vehiculoController.subirCalcomania);

export default router;
