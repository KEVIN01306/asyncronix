import { z } from "zod";
import { paginacionQuerySchema } from "@shared/presentation/validators/paginacion.query.schema.js";

const uuidArray = z.array(z.string().uuid());
const optionalUuidArray = z.preprocess((value) => {
    if (!value) return undefined;
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value;
    return undefined;
}, uuidArray).optional();

export const modeloListQuerySchema = paginacionQuerySchema.extend({
    marca_id: optionalUuidArray,
    linea_id: optionalUuidArray,
    cilindrada_id: optionalUuidArray,
    q: z.string().trim().optional(),
    anio: z.coerce.number().int().positive().optional(),
});

export const modeloIdParamSchema = z.object({ id: z.string().uuid('Modelo inválido') });
