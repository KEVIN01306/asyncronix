import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { cotizacionController } from '../cotizacion.module.js';
import {
    cotizacionCrearSchema,
    cotizacionActualizarEstadoSchema,
    convertirCotizacionSchema,
    cotizacionIdParamSchema,
    listarCotizacionesQuerySchema
} from './validators/cotizacion.validator.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_COTIZACIONES']),
    validar.validarBody(cotizacionCrearSchema),
    cotizacionController.crear
);

router.get(
    '/',
    auth.verificarPermiso(['VER_COTIZACIONES']),
    validar.validarQuery(listarCotizacionesQuerySchema),
    cotizacionController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_COTIZACIONES']),
    validar.validarParams(cotizacionIdParamSchema),
    cotizacionController.obtener
);

router.put(
    '/:id/estado',
    auth.verificarPermiso(['EDITAR_COTIZACIONES']),
    validar.validarParams(cotizacionIdParamSchema),
    validar.validarBody(cotizacionActualizarEstadoSchema),
    cotizacionController.actualizarEstado
);

router.post(
    '/:id/convertir',
    auth.verificarPermiso(['CONVERTIR_COTIZACIONES']),
    validar.validarParams(cotizacionIdParamSchema),
    validar.validarBody(convertirCotizacionSchema),
    cotizacionController.convertir
);

export default router;
