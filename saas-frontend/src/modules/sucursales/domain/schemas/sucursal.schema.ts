import z from 'zod';


export const sucursalSchema = z.object({
    id: z.string().optional(),
    nombre: z.string().min(1, 'El nombre es requerido'),
    direccion: z.string().min(1, 'La dirección es requerida'),
});

export type SucursalFormValues = z.infer<typeof sucursalSchema>;
