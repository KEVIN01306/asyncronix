import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { trasladoController } from '../traslado.module.js';
import { trasladoCrearSchema } from './validators/traslado.schema.js';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

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
    validar.validarQuery(paginacionQuerySchema),
    trasladoController.listarPorOrigen
);

router.get(
    '/destino/:destino_id',
    auth.verificarPermiso(['VER_TRASLADO']),
    validar.validarQuery(paginacionQuerySchema),
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
    trasladoController.cancelar
);

router.put(
    '/:id/recibir',
    auth.verificarPermiso(['RECIBIR_TRASLADO']),
    trasladoController.recibir
);

export default router;
