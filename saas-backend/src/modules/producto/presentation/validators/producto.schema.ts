import { z } from "zod";

const productoBaseSchema = z.object({
    categoria_id: z.string().uuid({ message: 'Selecciona una categoría válida' }),
    nombre: z.string().min(3, 'El nombre del producto es obligatorio').max(150),
    codigo: z.string().max(100).optional().nullable(),
    precio_sugerido: z.coerce.number().min(0, 'El precio no puede ser negativo'),
});

export const productoCrearSchema = productoBaseSchema;
export const productoActualizarSchema = productoBaseSchema.partial();

export const productoListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    categoria_id: z.string().uuid().optional(),
});
