import { z } from 'zod';

export const cajaCrearSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    tipo: z.enum(['FISICA', 'EN_LINEA']).optional(),
    activo: z.boolean().optional(),
});

export const cajaActualizarSchema = cajaCrearSchema.partial();

export const cajaIdParamSchema = z.object({
    id: z.string().uuid('Caja inválida'),
});

export const cajaListQuerySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().min(0).default(0),
    q: z.string().trim().optional(),
});

export const asociarDispositivoCajaSchema = z.object({
    pin_sucursal: z.string().trim().regex(/^[0-9]{4,6}$/, { message: 'El pin de sucursal debe contener entre 4 y 6 dígitos' }),
});

export const desasociarDispositivoCajaSchema = z.object({
    token_autorizado: z.string().trim().optional(),
});

