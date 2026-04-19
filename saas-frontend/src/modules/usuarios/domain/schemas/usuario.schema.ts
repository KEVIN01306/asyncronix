import z from "zod";
import { ROL_USUARIO } from "../enums/rol.enum";



export const usuarioSchema = z.object({
    id: z.string().max(36).optional(),
    nombre: z.string().max(100),
    telefono: z.string().max(20),
    rol: z.enum(ROL_USUARIO),
    password_hash: z.string().max(255).optional(),
    sucursal_id: z.string().max(36).nullable()
})

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;