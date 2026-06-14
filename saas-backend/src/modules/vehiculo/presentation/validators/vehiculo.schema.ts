import { z } from 'zod';
import { paginacionQuerySchema } from '@shared/presentation/validators/paginacion.query.schema.js';

export const vehiculoCrearSchema = z.object({
    placa: z.string(),
    modelo_id: z.string().uuid(),
    vehiculo_tipo_id: z.string().uuid(),
    cliente_id: z.string().uuid().optional()
});

export const vehiculoActualizarSchema = vehiculoCrearSchema.partial();

export const vehiculoListQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional(),
    placa: z.string().trim().optional(),
    vehiculo_tipo_id: z.string().uuid().optional(),
    modelo_id: z.string().uuid().optional(),
    marca_id: z.string().uuid().optional(),
    linea_id: z.string().uuid().optional(),
    cliente_dpi: z.string().trim().optional()
});

export const vehiculoAsociarClienteSchema = z.object({
    nit: z.string()
});

export const vehiculoCrearClienteSchema = z.object({
    nombre: z.string().min(1).max(100),
    nit: z.string().max(50).optional().nullable(),
    dpi: z.string().max(50).optional().nullable()
}).refine((d) => d.nit || d.dpi, { message: 'Se requiere NIT o DPI', path: ['nit'] });
