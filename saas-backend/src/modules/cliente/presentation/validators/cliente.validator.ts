import { z } from 'zod'

const transformNullish = (v: any) => v === '' ? null : v

export const clientesSchema = z.object({
    id: z.string().length(36),
    negocio_id: z.string().length(36),
    nombre: z.string().min(1).max(100),
    apellido: z.string().max(100).optional().nullish().transform(transformNullish),
    telefono: z.string().max(20),
    email: z.union([z.string().email(), z.literal('')]).optional().nullish().transform(transformNullish),
    nit: z.string().max(50).optional().nullish().transform(transformNullish),
    dpi: z.string().max(50).optional().nullish().transform(transformNullish),
    created_at: z.coerce.date().optional(),
    updated_at: z.coerce.date().optional(),
})

const clienteCrearShape = clientesSchema.omit({
    id: true,
    negocio_id: true,
    created_at: true,
    updated_at: true
})

export const clienteCrearSchema = clienteCrearShape.refine(
    (data) => data.nit || data.dpi,
    {
        message: "Se requiere NIT o DPI",
        path: ["nit"],
    }
)

export const clienteActualizarSchema = clienteCrearShape.partial().refine(
    (data) => {
        const hasNit = data.nit !== undefined && data.nit !== null
        const hasDpi = data.dpi !== undefined && data.dpi !== null

        if (hasNit && hasDpi) {
            return data.nit || data.dpi
        }
        return true
    },
    {
        message: "Se requiere un NIT o DPI válido si se actualiza la identidad",
        path: ["nit"],
    }
)

export const clienteBuscarSchema = z.object({
    nit: z.string().max(50).optional().nullish().transform(transformNullish),
    dpi: z.string().max(50).optional().nullish().transform(transformNullish),
}).refine(
    (data) => data.nit || data.dpi,
    {
        message: "Se requiere nit o dpi",
        path: ["nit"],
    }
)