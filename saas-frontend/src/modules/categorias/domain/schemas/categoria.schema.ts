import z from 'zod';

export const categoriaSchema = z.object({
    categoria: z.string().min(3, 'La categoría debe tener al menos 3 caracteres'),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;