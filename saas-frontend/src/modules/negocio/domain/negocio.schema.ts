import { z } from 'zod';

export const negocioSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    slug: z.string(),
    nombre_comercial: z.union([z.string(), z.null()]).transform(val => val ?? null),
    wa_id: z.string(),
    nit_rut: z.union([z.string(), z.null()]).transform(val => val ?? null),
    logo_url: z.union([z.string(), z.null()]).transform(val => val ?? null),
    slogan: z.union([z.string(), z.null()]).transform(val => val ?? null),
    datos_facturacion_json: z.any().nullable(),
    pais_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    moneda_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    instagram_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    facebook_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    activo: z.boolean(),
    fecha_registro: z.union([z.string(), z.null()]).transform(val => val ?? null),
    created_at: z.string(),
    updated_at: z.string(),
    pais: z.any().optional(),
    moneda: z.any().optional(),
});

export const negocioEditSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    nombre_comercial: z.union([z.string(), z.null()]).transform(val => val ?? null),
    nit_rut: z.union([z.string(), z.null()]).transform(val => val ?? null),
    slogan: z.union([z.string(), z.null()]).transform(val => val ?? null),
    pais_id: z.union([z.string().uuid(), z.null()]).transform(val => val ?? null),
    instagram_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    facebook_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
});

export type Negocio = z.infer<typeof negocioSchema>;
export type NegocioEditFormValues = z.infer<typeof negocioEditSchema>;