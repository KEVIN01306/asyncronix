import { z } from "zod";

export const checklistRespuestaCrearSchema = z.object({
    checklist_item_id: z.string().uuid(),
    estado: z.enum(['OPTIMO', 'REGULAR', 'REQUIERE_CAMBIO', 'NO_APLICA']),
    observaciones: z.string().optional().nullable()
});

export const checklistRespuestaActualizarSchema = checklistRespuestaCrearSchema.partial();
