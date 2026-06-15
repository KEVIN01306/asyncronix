import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const lineaListQuerySchema = paginacionQuerySchema.extend({
	q: z.string().trim().optional(),
});
export const lineaIdParamSchema = z.object({ id: z.string().uuid('Linea inválida') });
