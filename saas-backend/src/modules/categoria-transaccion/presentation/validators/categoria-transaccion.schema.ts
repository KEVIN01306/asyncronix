import { z } from 'zod';

export const categoriaTransaccionSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  tipo: z.enum(['INGRESO', 'EGRESO'], { errorMap: () => ({ message: 'El tipo debe ser ingreso o egreso' }) }),
  activo: z.boolean().optional(),
});

export const categoriaTransaccionActualizarSchema = categoriaTransaccionSchema.partial();

export const categoriaTransaccionListQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  offset: z.coerce.number().min(0).optional().default(0),
  q: z.string().trim().optional(),
  tipo: z.enum(['INGRESO', 'EGRESO']).optional(),
});
