import { Router } from 'express';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { loteController } from '../lote.module.js';
import { loteCrearSchema } from './validators/lote.schema.js';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

const routes = Router();

const validarMiddleware = new ValidarMiddleware();
const authMiddleware = new AuthMiddleware();

routes.use(authMiddleware.protegerRuta);

routes.post(
    '/',
    authMiddleware.verificarPermiso(['CREAR_LOTES']),
    validarMiddleware.validarBody(loteCrearSchema),
    loteController.registrar
);

routes.get(
    '/',
    authMiddleware.verificarPermiso(['VER_LOTES']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    loteController.listar
);

routes.get(
    '/producto/:producto_id',
    authMiddleware.verificarPermiso(['VER_LOTES']),
    validarMiddleware.validarQuery(paginacionQuerySchema),
    loteController.listarPorProducto
);

routes.get('/:id', authMiddleware.verificarPermiso(['VER_LOTES_DETALLE']), loteController.obtener);

export default routes;
