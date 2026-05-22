import { z } from 'zod';

const transformNullish = (val: string | null | undefined) => {
    if (val === null || val === undefined || val.trim() === '') return null;
    return val;
};

const nullableString = z.union([z.string(), z.null()]).optional().transform(transformNullish);

const optionalEmailSchema = z.union([
    z.string().email('El correo no es válido'),
    z.literal(''),
    z.null()
]).optional().transform(transformNullish);

export const clienteSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: nullableString,
    telefono: z.string().min(1, 'El teléfono es requerido'),
    email: optionalEmailSchema,
    nit: nullableString,
    dpi: nullableString,
    created_at: z.string(),
    updated_at: z.string(),
});

export const clienteFormSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: nullableString,
    telefono: z.string().min(1, 'El teléfono es requerido'),
    email: optionalEmailSchema,
    nit: nullableString,
    dpi: nullableString,
}).refine(
    (data) => {
        return data.nit !== null || data.dpi !== null;
    },
    {
        message: 'Debe ingresar al menos el NIT o el DPI',
        path: ['nit'],
    }
);

export type Cliente = z.infer<typeof clienteSchema>;
export type ClienteFormValues = z.infer<typeof clienteFormSchema>;

export type ClienteFormInput = z.input<typeof clienteFormSchema>;