import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const lineaListQuerySchema = paginacionQuerySchema;
export const lineaIdParamSchema = z.object({ id: z.string().uuid('Linea inválida') });
