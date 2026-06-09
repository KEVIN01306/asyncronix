import { z } from 'zod';

export const ProveedorSchema = z.object({
    nombre: z.string().min(1),
    contacto: z.string().optional().nullable(),
    telefono: z.string().min(1),
    email: z.string().email().optional().nullable(),
    nit: z.string().optional().nullable(),
});

export const ProveedorActualizarSchema = ProveedorSchema.partial();

export const ProveedorValidator = {
    crear: ProveedorSchema,
    actualizar: ProveedorActualizarSchema,
};

export default ProveedorValidator;
