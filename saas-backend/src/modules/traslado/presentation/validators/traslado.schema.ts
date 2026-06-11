import { z } from 'zod';

export const trasladoDetalleSchema = z.object({
    lote_id: z.string().uuid(),
    cantidad: z.coerce.number().int().positive(),
});

export const trasladoCrearSchema = z.object({
    sucursal_destino_id: z.string().uuid(),
    detalles: z.array(trasladoDetalleSchema).min(1),
});
