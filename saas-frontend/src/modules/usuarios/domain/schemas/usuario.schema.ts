import z from "zod";

export const usuarioCreateSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.union([z.string(), z.null()]).transform(val => val ?? null),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(1, 'El teléfono es requerido'),
    roles: z.array(z.string()),
    sucursal_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export const usuarioEditSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.union([z.string(), z.null()]).transform(val => val ?? null),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(1, 'El teléfono es requerido'),
    roles: z.array(z.string()),
    sucursal_id: z.union([z.string(), z.null()]).transform(val => val ?? null),
});

export type UsuarioCreateFormValues = z.infer<typeof usuarioCreateSchema>;
export type UsuarioEditFormValues = z.infer<typeof usuarioEditSchema>;

// Para envío al backend
export interface UsuarioCreatePayload {
    nombre: string;
    apellido: string | null;
    email: string;
    telefono: string;
    roles: string[];
    sucursal_id: string | null;
    password_hash: string;
}