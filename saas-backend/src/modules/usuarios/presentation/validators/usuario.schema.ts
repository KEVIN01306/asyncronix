import z from "zod";

export const usuariosSchema = z.object({
    id: z.string().max(36),
    negocio_id: z.string().max(36),
    sucursal_id: z.string().max(36),
    nombre: z.string().max(100),
    //correo:             z.string().max(100),
    password_hash: z.string(),
    telefono: z.string().max(20),
    verificado: z.boolean(),
    rol: z.enum(['ADMIN', 'VENDEDOR']),
    activo: z.boolean()
})

export const usuariosCrearSchema = usuariosSchema.omit({ id: true, negocio_id: true, verificado: true, activo: true })

export const usuarioActualizarSchema = usuariosSchema.omit({ id: true, negocio_id: true, password_hash: true, verificado: true, activo: true })