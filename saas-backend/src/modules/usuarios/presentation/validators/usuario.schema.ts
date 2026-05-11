import z, { email } from "zod";

export const usuariosSchema = z.object({
    id: z.string().max(36),
    negocio_id: z.string().max(36),
    sucursal_id: z.string().max(36),
    nombre: z.string().max(100),
    apellido: z.string().max(100).nullable(),
    email:  z.string().max(100).email(),
    password_hash: z.string(),
    telefono: z.string().max(20),
    verificado: z.boolean(),
    rolIds: z.array(z.string()),
    activo: z.boolean()
})

export const usuariosCrearSchema = usuariosSchema.omit({ id: true, negocio_id: true, verificado: true, activo: true })

export const usuarioActualizarSchema = usuariosSchema.omit({ id: true, negocio_id: true, password_hash: true, verificado: true, activo: true })