import z from 'zod';

export const facturacionConfigSchema = z.object({
    nit_emisor: z.string().min(1, 'El NIT es requerido').max(20),
    nombre_emisor: z.string().min(1, 'El nombre del emisor es requerido').max(255),
    nombre_comercial: z.string().min(1, 'El nombre comercial es requerido').max(255),
    afiliacion_iva: z.enum(['GEN', 'PEQ'], {
        message: "Seleccione un régimen válido ('GEN' o 'PEQ')"
    }),
    tipo_frase: z.preprocess((val) => Number(val), z.number().int().min(1, 'Tipo de frase inválido')),
    codigo_escenario: z.preprocess((val) => Number(val), z.number().int().min(1, 'Código de escenario inválido')),
    correo_emisor: z.string().email('Correo electrónico inválido').max(150),
    fel_username: z.string().min(1, 'El usuario FEL es requerido').max(100),
    fel_password: z.string().max(255).optional(),
    fel_ambiente: z.enum(['PRUEBAS', 'PRODUCCION'], {
        message: "Seleccione un ambiente válido"
    })
});

export type FacturacionConfigFormValues = z.infer<typeof facturacionConfigSchema>;
