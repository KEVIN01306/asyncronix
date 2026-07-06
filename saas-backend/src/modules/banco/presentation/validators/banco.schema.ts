import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const bancoListQuerySchema = paginacionQuerySchema.extend({
    q: z.string().trim().optional(),
});
export const bancoIdParamSchema = z.object({ id: z.string().uuid('Banco inválido') });
