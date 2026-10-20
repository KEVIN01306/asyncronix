import { z } from "zod";

export const listarFacturasQuerySchema = z.object({
    periodo: z.enum(['24_horas', 'ultimas_24_horas', '24h', '7_dias', 'ultimos_7_dias', '30_dias', 'ultimos_30_dias', 'este_mes', 'custom']).optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(10000).default(10),
    q: z.string().optional(),
});

export const resumenFiscalQuerySchema = z.object({
    periodo: z.enum(['24_horas', 'ultimas_24_horas', '24h', '7_dias', 'ultimos_7_dias', '30_dias', 'ultimos_30_dias', 'este_mes', 'custom']).optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
});

export const actualizarConfiguracionFiscalSchema = z.object({
    nit_emisor: z.string().min(1, "El NIT emisor es requerido").max(20),
    nombre_emisor: z.string().min(1, "El nombre emisor es requerido").max(255),
    nombre_comercial: z.string().min(1, "El nombre comercial es requerido").max(255),
    afiliacion_iva: z.enum(['GEN', 'PEQ'], {
        message: "La afiliación IVA debe ser 'GEN' o 'PEQ'"
    }),
    tipo_frase: z.coerce.number().int().positive(),
    codigo_escenario: z.coerce.number().int().positive(),
    correo_emisor: z.string().email("Correo electrónico inválido").max(150),
    fel_username: z.string().min(1, "El usuario FEL es requerido").max(100),
    fel_password: z.string().optional(),
    fel_ambiente: z.enum(['PRUEBAS', 'TEST', 'PRODUCCION'])
});

export const descargarDocumentoParamsSchema = z.object({
    id: z.string().uuid("ID de factura inválido"),
    tipo: z.enum(['xml', 'pdf'], {
        message: "El tipo de documento debe ser 'xml' o 'pdf'"
    })
});
