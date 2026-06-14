import { z } from 'zod';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

export const loteQuerySchema = paginacionQuerySchema.extend({
    q: z.string().optional(),
    codigo_lote: z.string().optional(),
    producto_codigo: z.string().optional(),
    codigo_secuencial: z.string().optional(),
    fecha_vencimiento_from: z.string().optional(),
    fecha_vencimiento_to: z.string().optional(),
    created_at_from: z.string().optional(),
    created_at_to: z.string().optional(),
});

export type LoteQuery = z.infer<typeof loteQuerySchema>;
