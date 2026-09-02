import z from 'zod';


export const sucursalSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    direccion: z.string().min(1, 'La dirección es requerida'),
    codigo_establecimiento: z.string().min(1, 'El código de establecimiento es requerido').default("1"),
    codigo_postal: z.string().optional(),
    departamento_id: z.string().optional(), // Virtual para el form, pero requerido si municipio es requerido
    division_nivel2_id: z.string().min(1, 'El municipio es requerido').optional(),
});

export type SucursalFormValues = z.infer<typeof sucursalSchema>;
