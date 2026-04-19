import { z } from 'zod';

export const loginSchema = z.object({
    telefono: z.string()
        .min(8, 'El número debe tener al menos 8 dígitos')
        .max(12, 'Número demasiado largo')
        .regex(/^\d+$/, 'Solo se permiten números'),
    password: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;