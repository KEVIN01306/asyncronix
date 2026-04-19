import { z } from 'zod'

const transformNullish = (v: any) => v === '' ? null : v

export const clientesSchema = z.object({
    id: z.string().min(36).max(36),
    negocio_id: z.string().min(36).max(36),
    nombre: z.string().max(100).optional().nullish().transform(transformNullish),
    telefono: z.string().max(20),
    email: z.string().email().optional().nullish().transform(transformNullish),
    direccion_entrega: z.string().optional().nullish().transform(transformNullish),
    fecha_registro: z.coerce.date().optional(),
})

export const clienteCrearSchema = clientesSchema.omit({ id: true, fecha_registro: true, negocio_id: true })

export const clienteActualizarSchema = clienteCrearSchema.partial()
