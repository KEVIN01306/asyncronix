import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { cajaController } from '../caja.module.js';
import { cajaCrearSchema, cajaActualizarSchema, cajaIdParamSchema, cajaListQuerySchema, asociarDispositivoCajaSchema, desasociarDispositivoCajaSchema } from './validators/caja.schema.js';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

router.use(auth.protegerRuta);

router.get('/',
    auth.verificarPermiso(['VER_CAJAS']),
    validar.validarQuery(cajaListQuerySchema),
    cajaController.listar
);

router.get('/:id',
    auth.verificarPermiso(['VER_CAJAS_DETALLE']),
    validar.validarParams(cajaIdParamSchema),
    cajaController.obtener
);

router.get('/:id/historial',
    auth.verificarPermiso(['VER_CAJAS_DETALLE']), // Or a specific permission if needed, using the same as detalle for now
    validar.validarParams(cajaIdParamSchema),
    cajaController.historial
);

router.post('/',
    auth.verificarPermiso(['CREAR_CAJAS']),
    validar.validarBody(cajaCrearSchema),
    cajaController.registrar
);

router.post('/:id/asociar-dispositivo',
    auth.verificarPermiso(['EDITAR_CAJAS']),
    validar.validarParams(cajaIdParamSchema),
    validar.validarBody(asociarDispositivoCajaSchema),
    cajaController.asociarDispositivo
);

router.post('/:id/desasociar-dispositivo',
    auth.verificarPermisoSome(['EDITAR_CAJAS', 'ADMIN_SUCURSAL']),
    validar.validarParams(cajaIdParamSchema),
    validar.validarBody(desasociarDispositivoCajaSchema),
    cajaController.desasociarDispositivo
);

router.put('/:id',
    auth.verificarPermiso(['EDITAR_CAJAS']),
    validar.validarParams(cajaIdParamSchema),
    validar.validarBody(cajaActualizarSchema),
    cajaController.actualizar
);

router.delete('/:id',
    auth.verificarPermiso(['ELIMINAR_CAJAS']),
    validar.validarParams(cajaIdParamSchema),
    cajaController.eliminar
);

export default router;
