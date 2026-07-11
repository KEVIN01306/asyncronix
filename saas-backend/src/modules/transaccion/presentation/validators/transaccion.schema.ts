import { z } from 'zod';

export const crearIngresoEgresoSchema = z
    .object({
        categoria_id: z.string().uuid('Categoría inválida'),
        tipo_movimiento: z.enum(['INGRESO', 'EGRESO'], {
            message: 'Tipo de movimiento inválido',
        }),
        entidad_tipo: z.enum(['CAJA', 'CUENTA'], {
            message: 'Tipo de entidad inválido',
        }),
        entidad_id: z.string().uuid('Entidad inválida'),
        moneda_id: z.string().uuid('Moneda inválida').optional(),
        monto_original: z.number().positive('El monto debe ser positivo').optional(),
        monto_moneda_base: z.number().positive('El monto debe ser positivo').optional(),
        tipo_cambio: z.number().positive('El tipo de cambio debe ser positivo').optional(),
        descripcion: z.string().optional(),
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

export const ingresoEgresoIdParamSchema = z.object({
    id: z.string().uuid('Movimiento inválido'),
});

export const listarIngresosEgresosQuerySchema = z.object({
    limit: z.coerce.number().min(1).default(10),
    offset: z.coerce.number().min(0).default(0),
    q: z.string().optional(),
    tipo_movimiento: z.enum(['INGRESO', 'EGRESO']).optional(),
    categoria_id: z.string().uuid('Categoría inválida').optional(),
    entidad_tipo: z.enum(['CAJA', 'CUENTA']).optional(),
    entidad_id: z.string().uuid('Entidad inválida').optional(),
    fecha_inicio: z.string().datetime().optional(),
    fecha_fin: z.string().datetime().optional(),
});
