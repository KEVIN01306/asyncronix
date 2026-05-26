import { Router } from 'express';
import { ValidarMiddleware } from '../../../app/middlewares/ValidarMiddleware.js';
import { AuthMiddleware } from '../../../app/middlewares/AuthMiddleware.js';
import { notificacionController } from '../notificacion.module.js';
import { guardarTokenNotificacionSchema } from './validators/notificacion.schema.js';

const router = Router();
const validar = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.post(
  '/save-token',
  validar.validarBody(guardarTokenNotificacionSchema),
  notificacionController.guardarToken
);

export default router;
