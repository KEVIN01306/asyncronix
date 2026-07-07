import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { categoriaTransaccionController } from '../categoria-transaccion.module.js';
import { categoriaTransaccionSchema, categoriaTransaccionActualizarSchema, categoriaTransaccionListQuerySchema } from './validators/categoria-transaccion.schema.js';

const router = Router();
const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
  '/',
  authMiddleware.verificarPermiso(['CREAR_CATEGORIAS_TRANSACCION']),
  validarMiddleware.validarBody(categoriaTransaccionSchema),
  categoriaTransaccionController.registrar
);

router.get(
  '/',
  authMiddleware.verificarPermiso(['VER_CATEGORIAS_TRANSACCION']),
  validarMiddleware.validarQuery(categoriaTransaccionListQuerySchema),
  categoriaTransaccionController.listar
);

router.get(
  '/:id',
  authMiddleware.verificarPermiso(['VER_CATEGORIAS_TRANSACCION_DETALLE']),
  categoriaTransaccionController.obtener
);

router.put(
  '/:id',
  authMiddleware.verificarPermiso(['EDITAR_CATEGORIAS_TRANSACCION']),
  validarMiddleware.validarBody(categoriaTransaccionActualizarSchema),
  categoriaTransaccionController.actualizar
);

router.delete(
  '/:id',
  authMiddleware.verificarRol(['ELIMINAR_CATEGORIAS_TRANSACCION']),
  categoriaTransaccionController.eliminar
);

export default router;
