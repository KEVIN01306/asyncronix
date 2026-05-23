import { z } from 'zod';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

export const vehiculoCrearSchema = z.object({
    placa: z.string(),
    modelo_id: z.string().uuid(),
    vehiculo_tipo_id: z.string().uuid(),
    cliente_id: z.string().uuid().optional()
});

export const vehiculoActualizarSchema = vehiculoCrearSchema.partial();

export const vehiculoListQuerySchema = paginacionQuerySchema;
