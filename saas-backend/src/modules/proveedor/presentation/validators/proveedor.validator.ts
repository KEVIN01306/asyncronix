import { z } from 'zod';

const optionalTrimmedString = z.preprocess(
    (value) => typeof value === 'string' ? value.trim() : value,
    z.string().optional().nullable(),
);

const optionalEmail = z.preprocess(
    (value) => typeof value === 'string' ? value.trim() : value,
    z.union([z.string().email(), z.literal('')]).optional().nullable(),
).transform((value) => value === '' ? null : value);

const optionalTelefono = optionalTrimmedString.transform((value) => value ?? '');

export const ProveedorSchema = z.object({
    nombre: z.string().min(1),
    contacto: optionalTrimmedString,
    telefono: optionalTelefono,
    email: optionalEmail,
    nit: optionalTrimmedString,
});

export const ProveedorActualizarSchema = ProveedorSchema.partial();

export const ProveedorValidator = {
    crear: ProveedorSchema,
    actualizar: ProveedorActualizarSchema,
};

export default ProveedorValidator;
