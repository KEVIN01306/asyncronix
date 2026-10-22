import { z } from 'zod';

const transformNullish = (v: any) => (v === '' || v === undefined ? null : v);

export const clienteBaseSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es requerido').max(100),
    apellido: z.string().trim().max(100).optional().nullish().transform(transformNullish),
    telefono: z.string().trim().max(25).optional().nullish().transform(transformNullish),
    email: z.union([z.string().trim().email('Formato de correo inválido'), z.literal('')]).optional().nullish().transform(transformNullish),
    nit: z.string().trim().max(50).optional().nullish().transform(transformNullish),
    dpi: z.string().trim().max(50).optional().nullish().transform(transformNullish),
});

export const clienteCrearSchema = clienteBaseSchema;

export const clienteActualizarSchema = clienteBaseSchema.partial();

export const clienteBuscarSchema = z.object({
    nit: z.string().trim().max(50).optional(),
    dpi: z.string().trim().max(50).optional(),
    soloNegocio: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional().default(false)),
}).refine((data) => Boolean(data.nit || data.dpi), {
    message: 'Debes enviar al menos NIT o DPI para buscar',
    path: ['dpi'],
});

export const clienteListQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    q: z.string().trim().optional(),
    documento: z.string().trim().optional(),
});

export const clienteBuscarGlobalQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(50).optional().default(10),
    q: z.string().trim().optional(),
    documento: z.string().trim().optional(),
});

export const clienteUnificarResumenQuerySchema = z.object({
    origen_id: z.string().trim().min(1, 'ID de origen requerido'),
    destino_id: z.string().trim().min(1, 'ID de destino requerido'),
});

export const clienteUnificarSchema = z.object({
    cliente_conservar_id: z.string().trim().min(1, 'ID del cliente a conservar es requerido'),
    cliente_eliminar_id: z.string().trim().min(1, 'ID del cliente a eliminar es requerido'),
    adoptar_datos_faltantes: z.boolean().optional().default(true),
    datos_fusionados: z.object({
        nombre: z.string().trim().optional(),
        apellido: z.string().trim().optional().nullable(),
        telefono: z.string().trim().optional().nullable(),
        email: z.string().trim().email().optional().nullable(),
        nit: z.string().trim().optional().nullable(),
        dpi: z.string().trim().optional().nullable(),
    }).optional(),
}).refine((data) => data.cliente_conservar_id !== data.cliente_eliminar_id, {
    message: 'El cliente a conservar y el cliente a eliminar deben ser diferentes',
    path: ['cliente_eliminar_id'],
});