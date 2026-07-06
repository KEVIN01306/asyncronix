import { z } from 'zod';

export const cuentaBancariaCrearSchema = z.object({
    banco_id: z.string().uuid('Banco inválido'),
    moneda_id: z.string().uuid('Moneda inválida').optional().nullable(),
    numero_cuenta: z.string().min(1, 'El número de cuenta es requerido'),
    nombre_titular: z.string().min(1, 'El nombre del titular es requerido'),
    tipo: z.enum(['MONETARIA', 'AHORRO', 'PLANILLA']).optional(),
    activo: z.boolean().optional(),
});

export const cuentaBancariaActualizarSchema = cuentaBancariaCrearSchema.partial();

export const cuentaBancariaIdParamSchema = z.object({
    id: z.string().uuid('Cuenta bancaria inválida'),
});

export const cuentaBancariaListQuerySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    offset: z.coerce.number().int().min(0).default(0),
    q: z.string().trim().optional(),
});
