import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const monedaListQuerySchema = paginacionQuerySchema.extend({
	q: z.string().trim().optional(),
});
export const monedaIdParamSchema = z.object({ id: z.string().uuid('Moneda inválida') });
