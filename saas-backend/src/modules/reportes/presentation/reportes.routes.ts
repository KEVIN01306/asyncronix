import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { reporteController } from '../reportes.module.js';

const router = Router();
const auth = new AuthMiddleware();

router.use(auth.protegerRuta);

router.get(
    '/financiero',
    auth.verificarPermiso(['REPORTES_FINANCIERO']),
    reporteController.obtenerReporteFinanciero
);

router.get(
    '/financiero/origen/:origen',
    auth.verificarPermiso(['REPORTES_FINANCIERO']),
    reporteController.obtenerDetalleOrigen
);

export default router;
