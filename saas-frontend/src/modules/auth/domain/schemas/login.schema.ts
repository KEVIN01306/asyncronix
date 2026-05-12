import { email, z } from 'zod';

export const loginSchema = z.object({
    email: email(),
    password: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;