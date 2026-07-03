import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const cilindradaListQuerySchema = paginacionQuerySchema.extend({
	q: z.string().trim().optional(),
});

export const cilindradaIdParamSchema = z.object({ id: z.string().uuid('Cilindrada inválida') });
