import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const marcaListQuerySchema = paginacionQuerySchema;
export const marcaIdParamSchema = z.object({ id: z.string().uuid('Marca inválida') });
