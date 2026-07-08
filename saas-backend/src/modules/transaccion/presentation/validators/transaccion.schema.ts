import { z } from 'zod';

export const crearMovimientoSchema = z
    .object({
        categoria_id: z.string().uuid('Categoría inválida'),
        tipo_movimiento: z.enum(['INGRESO', 'EGRESO'], {
            errorMap: () => ({ message: 'Tipo de movimiento inválido' }),
        }),
        entidad_tipo: z.enum(['CAJA', 'CUENTA'], {
            errorMap: () => ({ message: 'Tipo de entidad inválido' }),
        }),
        entidad_id: z.string().uuid('Entidad inválida'),
        moneda_id: z.string().uuid('Moneda inválida').optional(),
        monto_original: z.number().positive('El monto debe ser positivo').optional(),
        tipo_cambio: z.number().positive().optional(),
        monto_moneda_base: z.number().positive('El monto debe ser positivo').optional(),
        descripcion: z.string().max(500, 'Descripción muy larga').optional().nullable(),
        fecha_transaccion: z.coerce.date().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.monto_original === undefined && data.monto_moneda_base === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['monto_original'],
                message: 'Debe especificar un monto',
            });
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['monto_moneda_base'],
                message: 'Debe especificar un monto',
            });
        }
    });

export const movimientoIdParamSchema = z.object({
    id: z.string().uuid('Movimiento inválido'),
});

export const listarMovimientosQuerySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().min(0).default(0),
    q: z.string().trim().optional(),
    tipo_movimiento: z.enum(['INGRESO', 'EGRESO']).optional(),
    categoria_id: z.string().uuid().optional(),
    entidad_tipo: z.enum(['CAJA', 'CUENTA']).optional(),
    entidad_id: z.string().uuid().optional(),
    fecha_inicio: z.coerce.date().optional(),
    fecha_fin: z.coerce.date().optional(),
});
