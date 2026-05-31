import { z } from "zod";

export const tipoServicioSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    precio_base: z.coerce.number().min(0, 'El precio base debe ser un número mayor o igual a 0'),
    checklist: z.boolean().optional().default(true),
    opciones_ids: z.array(z.string()).optional(),
});

export const tipoServicioActualizarSchema = tipoServicioSchema.partial();
