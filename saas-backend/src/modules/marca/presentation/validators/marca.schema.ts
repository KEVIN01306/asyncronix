import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const marcaListQuerySchema = paginacionQuerySchema.extend({
	q: z.string().trim().optional(),
});
export const marcaIdParamSchema = z.object({ id: z.string().uuid('Marca inválida') });
