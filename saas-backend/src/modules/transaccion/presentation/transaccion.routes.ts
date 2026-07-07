import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { transaccionController } from '../transaccion.module.js';
import {
    crearMovimientoSchema,
    movimientoIdParamSchema,
    listarMovimientosQuerySchema,
} from './validators/transaccion.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get(
    '/',
    auth.verificarPermiso(['VER_MOVIMIENTOS']),
    validar.validarQuery(listarMovimientosQuerySchema),
    transaccionController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_MOVIMIENTOS_DETALLE']),
    validar.validarParams(movimientoIdParamSchema),
    transaccionController.obtener
);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_MOVIMIENTOS']),
    validar.validarBody(crearMovimientoSchema),
    transaccionController.crear
);

export default router;
