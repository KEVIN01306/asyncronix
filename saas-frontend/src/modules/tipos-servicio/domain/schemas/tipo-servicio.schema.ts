import z from 'zod';

export const tipoServicioSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    precio_base: z.number().min(0, 'El precio base debe ser mayor o igual a 0'),
    opciones_ids: z.array(z.string()).optional(),
});

export type TipoServicioFormValues = z.infer<typeof tipoServicioSchema>;
