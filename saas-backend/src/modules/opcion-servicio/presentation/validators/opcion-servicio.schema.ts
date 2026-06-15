import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const opcionServicioSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    descripcion: z.string().optional(),
});

export const opcionServicioActualizarSchema = opcionServicioSchema.partial();

export const opcionServicioListQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional(),
});
