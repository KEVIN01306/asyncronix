import { z } from 'zod';

export const ingresoEgresoSchema = z
    .object({
        categoria_id: z.string().min(1, 'Categoría requerida'),
        tipo_movimiento: z.enum(['INGRESO', 'EGRESO'] as const).refine((value) => !!value, {
            message: 'Tipo de movimiento requerido',
        }),
        entidad_tipo: z.enum(['CAJA', 'CUENTA'] as const).refine((value) => !!value, {
            message: 'Tipo de entidad requerida',
        }),
        entidad_id: z.string().min(1, 'Entidad requerida'),
        moneda_id: z.string().optional(),
        monto_original: z.number().positive('Monto debe ser positivo').optional(),
        monto_moneda_base: z.number().positive('Monto debe ser positivo').optional(),
        tipo_cambio: z.number().positive().optional(),
        descripcion: z.string().optional(),
        fecha_transaccion: z.string().optional(),
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
