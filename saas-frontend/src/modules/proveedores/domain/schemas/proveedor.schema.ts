import { z } from 'zod';

export const proveedorSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    telefono: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;