import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { cuentaBancariaController } from '../cuenta-bancaria.module.js';
import {
    cuentaBancariaCrearSchema,
    cuentaBancariaActualizarSchema,
    cuentaBancariaIdParamSchema,
    cuentaBancariaListQuerySchema,
} from './validators/cuenta-bancaria.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get(
    '/',
    auth.verificarPermiso(['VER_CUENTA_BANCARIA']),
    validar.validarQuery(cuentaBancariaListQuerySchema),
    cuentaBancariaController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_CUENTA_BANCARIA']),
    validar.validarParams(cuentaBancariaIdParamSchema),
    cuentaBancariaController.obtener
);

router.get(
    '/:id/historial',
    auth.verificarPermiso(['VER_CUENTA_BANCARIA']),
    validar.validarParams(cuentaBancariaIdParamSchema),
    cuentaBancariaController.historial
);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_CUENTA_BANCARIA']),
    validar.validarBody(cuentaBancariaCrearSchema),
    cuentaBancariaController.registrar
);

router.put(
    '/:id',
    auth.verificarPermiso(['EDITAR_CUENTA_BANCARIA']),
    validar.validarParams(cuentaBancariaIdParamSchema),
    validar.validarBody(cuentaBancariaActualizarSchema),
    cuentaBancariaController.actualizar
);

router.delete(
    '/:id',
    auth.verificarPermiso(['ELIMINAR_CUENTA_BANCARIA']),
    validar.validarParams(cuentaBancariaIdParamSchema),
    cuentaBancariaController.eliminar
);

export default router;
