import { Router } from 'express';
import { AuthMiddleware } from '@app/middlewares/AuthMiddleware.js';
import { ValidarMiddleware } from '@app/middlewares/ValidarMiddleware.js';
import { movimientoInternoController } from '../transaccion.module.js';
import { z } from 'zod';

const router = Router();
const auth = new AuthMiddleware();
const validar = new ValidarMiddleware();

const movimientoInternoSchema = z.object({
    origen_entidad: z.enum(['CAJA', 'CUENTA']),
    origen_id: z.string().uuid(),
    destino_entidad: z.enum(['CAJA', 'CUENTA']),
    destino_id: z.string().uuid(),
    monto_original: z.number().positive(),
    descripcion: z.string().min(1, "La descripción es requerida")
}).refine(data => {
    return !(data.origen_entidad === data.destino_entidad && data.origen_id === data.destino_id);
}, {
    message: "La entidad de origen y destino no pueden ser la misma",
    path: ["destino_id"]
});

const movimientoInternoIdParamSchema = z.object({
    id: z.string().uuid('Movimiento interno inválido'),
});

const listarMovimientosInternosQuerySchema = z.object({
    limit: z.coerce.number().min(1).default(10),
    offset: z.coerce.number().min(0).default(0),
    q: z.string().optional(),
    entidad_tipo: z.enum(['CAJA', 'CUENTA']).optional(),
    entidad_id: z.string().uuid('Entidad inválida').optional(),
    fecha_inicio: z.string().datetime().optional(),
    fecha_fin: z.string().datetime().optional(),
});

router.use(auth.protegerRuta);

router.post(
    '/',
    auth.verificarPermiso(['CREAR_MOVIMIENTOS']),
    validar.validarBody(movimientoInternoSchema),
    movimientoInternoController.crear
);

router.get(
    '/',
    auth.verificarPermiso(['VER_MOVIMIENTOS']),
    validar.validarQuery(listarMovimientosInternosQuerySchema),
    movimientoInternoController.listar
);

router.get(
    '/:id',
    auth.verificarPermiso(['VER_MOVIMIENTOS_DETALLE']),
    validar.validarParams(movimientoInternoIdParamSchema),
    movimientoInternoController.obtener
);

export default router;
