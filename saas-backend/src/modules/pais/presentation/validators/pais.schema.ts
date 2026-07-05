import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const paisListQuerySchema = paginacionQuerySchema.extend({
	q: z.string().trim().optional(),
});
export const paisIdParamSchema = z.object({ id: z.string().uuid('País inválido') });
