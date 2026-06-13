import { z } from 'zod';

const optionalString = z.string().trim().optional().nullable().or(z.literal('')).transform((value) => {
    if (value === '' || value === undefined) return null;
    return value;
});

export const trasladoDetalleSchema = z.object({
    lote_id: z.string().uuid(),
    cantidad: z.coerce.number().int().positive(),
});

export const trasladoCrearSchema = z.object({
    sucursal_destino_id: z.string().uuid(),
    detalles: z.array(trasladoDetalleSchema).min(1),
});

export const trasladoListQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    q: optionalString,
    guia: optionalString,
    creador: optionalString,
    recibidor: optionalString,
    estado: z.enum(['PENDIENTE', 'COMPLETADO', 'CANCELADO']).optional(),
    fecha_inicio: optionalString,
    fecha_fin: optionalString,
    fecha_recibido_inicio: optionalString,
    fecha_recibido_fin: optionalString,
});

export const trasladoAccionSchema = z.object({
    comentario: z.string().trim().min(1, 'El comentario es obligatorio'),
});
