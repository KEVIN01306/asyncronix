import { z } from 'zod'

const transformNullish = (v: any) => v === '' ? null : v

export const negociosSchema = z.object({
    id: z.string().min(36).max(36),
    nombre_comercial: z.string(),
    nombre: z.string(),
    wa_id: z.string().max(15),
    nit_rut: z.string().max(20).optional().nullish().transform(transformNullish),
    logo_url: z.string().optional().nullish().transform(transformNullish),
    slogan: z.string().max(255).optional().nullish().transform(transformNullish),
    datos_facturacion_json: z.any().optional().nullish().transform(transformNullish),
    fecha_registro: z.coerce.date().default(new Date()),
    pais_id: z.string().uuid('País inválido').optional().nullish().transform(transformNullish),
    moneda_id: z.string().uuid('Moneda inválida').optional().nullish().transform(transformNullish),
    instagram_id: z.string().max(100).optional().nullish().transform(transformNullish),
    facebook_id: z.string().max(100).optional().nullish().transform(transformNullish),
})

export const negocioCrearSchema = negociosSchema.omit({ id: true, fecha_registro: true, logo_url: true })

export const negocioActualizarSchema = negocioCrearSchema.partial()

export const negocioCambiarMonedaSchema = z.object({
    moneda_id: z.string().uuid('Moneda inválida'),
})
