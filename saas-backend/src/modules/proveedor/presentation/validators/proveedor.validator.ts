import { z } from 'zod'

const transformNullish = (v: any) => v === '' ? null : v

export const proveedoresSchema = z.object({
    id: z.string().min(36).max(36),
    negocio_id: z.string().min(36).max(36),
    nombre: z.string().max(100),
    telefono: z.string().max(20).optional().nullish().transform(transformNullish),
})

export const proveedorCrearSchema = proveedoresSchema.omit({ id: true, negocio_id: true })

export const proveedorActualizarSchema = proveedorCrearSchema.partial()
