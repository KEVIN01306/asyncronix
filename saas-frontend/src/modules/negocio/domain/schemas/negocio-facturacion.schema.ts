import z from 'zod';

export const negocioFacturacionSchema = z.object({
    nit_emisor: z.string().min(1, 'Requerido').max(20),
    nombre_emisor: z.string().min(1, 'Requerido').max(255),
    nombre_comercial: z.string().min(1, 'Requerido').max(255),
    afiliacion_iva: z.string().min(1, 'Requerido').max(10),
    tipo_frase: z.preprocess((val) => Number(val), z.number().int().min(1)),
    codigo_escenario: z.preprocess((val) => Number(val), z.number().int().min(1)),
    correo_emisor: z.string().email('Email inválido').max(150),
    fel_username: z.string().min(1, 'Requerido').max(100),
    fel_password: z.string().max(255).optional(),
    fel_ambiente: z.string().min(1, 'Requerido').max(10)
});

export type NegocioFacturacionFormValues = z.infer<typeof negocioFacturacionSchema>;
