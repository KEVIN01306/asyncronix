import { z } from "zod";

export const opcionServicioSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().optional(),
});

export const opcionServicioActualizarSchema = opcionServicioSchema.partial();
