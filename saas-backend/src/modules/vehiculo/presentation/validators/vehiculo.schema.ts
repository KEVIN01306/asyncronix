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
    documento: z.string().trim().optional(),
    dpi: z.string().trim().optional(),
    nit: z.string().trim().optional()
}).refine((d) => Boolean(d.documento || d.dpi || d.nit), {
    message: 'Se requiere DPI o NIT para asociar',
    path: ['documento']
});

export const vehiculoCrearClienteSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
    apellido: z.string().trim().max(100).optional().nullable(),
    dpi: z.string().trim().max(50).optional().nullable(),
    nit: z.string().trim().max(50).optional().nullable(),
    telefono: z.string().trim().max(25).optional().nullable(),
    email: z.union([z.string().trim().email('Formato de correo inválido'), z.literal('')]).optional().nullable()
});
