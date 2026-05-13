import z, { string } from "zod";


export const usuarioSchema = z.object({
    id: z.string().max(36).optional(),
    nombre: z.string().max(100),
    apellido: z.string().max(100).nullable(),
    email:  z.string().max(100).email(),
    telefono: z.string().max(20),
    roles: z.array(string()),
    password_hash: z.string().max(255).optional(),
    sucursal_id: z.string().max(36).nullable()
})

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;