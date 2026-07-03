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

export const modeloCrearPorPinSchema = z.object({
    anio: z.coerce.number().int().min(1900, 'Año inválido').max(2100, 'Año inválido'),
    marca_id: z.string().uuid('Marca inválida'),
    linea_id: z.string().uuid('Línea inválida'),
    cilindrada_id: z.string().uuid('Cilindrada inválida'),
    vehiculo_tipo_id: z.string().uuid('Tipo de vehículo inválido'),
    pin_modelo: z.string().regex(/^[0-9]{4,6}$/, { message: 'El PIN debe contener entre 4 y 6 dígitos' }),
});
