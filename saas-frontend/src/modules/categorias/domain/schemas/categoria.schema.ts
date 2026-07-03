import z from 'zod';

export const categoriaSchema = z.object({
    categoria: z.string().min(3, 'La categoría debe tener al menos 3 caracteres'),
    categoria_padre_id: z.string().uuid('Debe seleccionar una categoría padre válida'),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;