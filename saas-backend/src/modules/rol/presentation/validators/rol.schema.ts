import z from "zod";

export const rolSchema = z.object({
    id: z.string().max(36),
    negocio_id: z.string().max(36),
    nombre: z.string().max(100),
    descripcion: z.string().max(255).nullable(),
    permisoIds: z.array(z.string().max(36)).default([]),
    activo: z.boolean()
})

export const rolCrearSchema = rolSchema.omit({ id: true, negocio_id: true, activo: true })
export const rolActualizarSchema = rolSchema.omit({ id: true, negocio_id: true, activo: true })
