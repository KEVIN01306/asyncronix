import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { transaccionController } from '../transaccion.module.js';
import {
    crearIngresoEgresoSchema,
    ingresoEgresoIdParamSchema,
    listarIngresosEgresosQuerySchema,
} from './validators/transaccion.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get(
    '/',
    auth.verificarPermiso(['VER_INGRESOS_EGRESOS']),
    validar.validarQuery(listarIngresosEgresosQuerySchema),
    transaccionController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_INGRESOS_EGRESOS_DETALLE']),
    validar.validarParams(ingresoEgresoIdParamSchema),
    transaccionController.obtener
);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_INGRESOS_EGRESOS']),
    validar.validarBody(crearIngresoEgresoSchema),
    transaccionController.crear
);

export default router;
