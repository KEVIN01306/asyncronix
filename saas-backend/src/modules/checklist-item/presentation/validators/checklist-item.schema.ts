import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const checklistItemSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
});

export const checklistItemActualizarSchema = checklistItemSchema.partial();

export const checklistItemListQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional(),
});
