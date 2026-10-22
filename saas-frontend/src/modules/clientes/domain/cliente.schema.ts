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

const dpiSchema = z.union([
    z.string().refine((val) => {
        const clean = val.replace(/\D/g, '');
        return clean.length === 0 || clean.length === 13;
    }, { message: 'El DPI debe contener 13 dígitos numéricos' }),
    z.null(),
]).optional().transform((val) => {
    if (!val) return null;
    const clean = val.replace(/\D/g, '');
    return clean === '' ? null : clean;
});

export const clienteSchema = z.object({
    id: z.string(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: nullableString,
    telefono: nullableString,
    email: optionalEmailSchema,
    nit: nullableString,
    dpi: nullableString,
    created_at: z.string(),
    updated_at: z.string(),
});

export const clienteFormSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: nullableString,
    telefono: nullableString,
    email: optionalEmailSchema,
    nit: nullableString,
    dpi: dpiSchema,
}).refine(
    (data) => {
        return data.dpi !== null || data.nit !== null;
    },
    {
        message: 'Debe ingresar al menos el DPI o el NIT',
        path: ['dpi'],
    }
);

export type Cliente = z.infer<typeof clienteSchema>;
export type ClienteFormValues = z.infer<typeof clienteFormSchema>;

export type ClienteFormInput = z.input<typeof clienteFormSchema>;