import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { verificationCodeController } from '../verificationCode.module.js';
import { verificarCodigoSchema } from './validators/verification-code.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get('/status', verificationCodeController.status);
router.post('/send', verificationCodeController.send);
router.post('/verify', validar.validarBody(verificarCodigoSchema), verificationCodeController.verify);

export default router;
