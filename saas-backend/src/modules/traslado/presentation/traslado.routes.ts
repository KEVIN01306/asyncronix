import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { trasladoController } from '../traslado.module.js';
import { trasladoCrearSchema, trasladoListQuerySchema, trasladoAccionSchema } from './validators/traslado.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_TRASLADO']),
    validar.validarBody(trasladoCrearSchema),
    trasladoController.registrar
);

router.get(
    '/origen/:origen_id',
    auth.verificarPermiso(['VER_TRASLADO']),
    validar.validarQuery(trasladoListQuerySchema),
    trasladoController.listarPorOrigen
);

router.get(
    '/destino/:destino_id',
    auth.verificarPermiso(['VER_TRASLADO']),
    validar.validarQuery(trasladoListQuerySchema),
    trasladoController.listarPorDestino
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_TRASLADO_DETALLE']),
    trasladoController.obtener
);

router.put(
    '/:id/cancelar',
    auth.verificarPermiso(['CANCELAR_TRASLADO']),
    validar.validarBody(trasladoAccionSchema),
    trasladoController.cancelar
);

router.put(
    '/:id/recibir',
    auth.verificarPermiso(['RECIBIR_TRASLADO']),
    validar.validarBody(trasladoAccionSchema),
    trasladoController.recibir
);

export default router;
