import { z } from 'zod';

export const productoSchema = z.object({
    categoria_id: z.string().min(1, 'Selecciona una categoría'),
    nombre: z.string().min(3, 'El nombre del producto es obligatorio').max(120, 'El nombre no puede superar los 120 caracteres'),
    precio_sugerido: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0'),
});

export type ProductoFormValues = z.infer<typeof productoSchema>;
