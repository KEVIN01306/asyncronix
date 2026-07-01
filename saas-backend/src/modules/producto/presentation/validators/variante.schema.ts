import { z } from "zod";

export const varianteCrearSchema = z.object({
    precio_sugerido: z.coerce.number().min(0, 'El precio sugerido es obligatorio'),
    codigo_barras: z.string().max(100).optional().nullable(),
    imagen_id: z.string().uuid({ message: 'Imagen inválida' }).nullable().optional(),
    valor_atributo_ids: z.array(z.string().uuid({ message: 'Selecciona valores de atributo válidos' })).optional()
});

export const varianteActualizarSchema = varianteCrearSchema.partial();

export const varianteCodigoBarrasSchema = z.object({
    codigo_barras: z.string().min(1, 'El código de barras es obligatorio').max(100)
});
