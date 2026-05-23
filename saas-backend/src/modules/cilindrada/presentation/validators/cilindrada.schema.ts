import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

export const cilindradaListQuerySchema = paginacionQuerySchema;

export const cilindradaIdParamSchema = z.object({ id: z.string().uuid('Cilindrada inválida') });
