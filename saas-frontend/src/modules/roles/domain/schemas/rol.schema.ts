import z from 'zod';

export const rolSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().transform(val => val || null).nullish(),
});

export type RolFormValues = z.infer<typeof rolSchema>;
