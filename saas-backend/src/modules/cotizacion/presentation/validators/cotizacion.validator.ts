import { z } from "zod";
import { EstadoCotizacion, TipoDestinoCotizacion } from "@prisma/client";

export const cotizacionDetalleCrearSchema = z.object({
    variante_id: z.string().uuid().optional().nullable(),
    tipo_servicio_id: z.string().uuid().optional().nullable(),
    descripcion: z.string().min(1, "La descripción es requerida").max(255),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
    precio_unitario: z.number().min(0, "El precio no puede ser negativo"),
    descuento: z.number().min(0).optional().default(0)
}).refine(data => {
    // Si no es un texto libre, debería tener o variante o tipo de servicio
    // Pero si es texto libre no tiene ninguno. 
    return true;
});

export const cotizacionCrearSchema = z.object({
    cliente_id: z.string().uuid().optional().nullable(),
    vehiculo_id: z.string().uuid().optional().nullable(),
    fecha_validez: z.string().datetime().optional().nullable(),
    tipo_destino: z.nativeEnum(TipoDestinoCotizacion),
    terminos: z.string().optional().nullable(),
    detalles: z.array(cotizacionDetalleCrearSchema).min(1, "Debe incluir al menos un detalle")
});

export const cotizacionActualizarEstadoSchema = z.object({
    estado: z.nativeEnum(EstadoCotizacion)
});

export const convertirCotizacionSchema = z.object({
    metodo_pago: z.string().optional(),
    opcionesCaja: z.object({
        caja_id: z.string().uuid().optional(),
        token_autorizado: z.string().optional(),
        forzar_caja_en_linea: z.boolean().optional()
    }).optional(),
    ignoreStock: z.boolean().optional(),
    tipo_servicio_id: z.string().uuid().optional()
});

export const cotizacionIdParamSchema = z.object({
    id: z.string().uuid('Cotización inválida'),
});

export const listarCotizacionesQuerySchema = z.object({
    limit: z.coerce.number().min(1).default(10),
    offset: z.coerce.number().min(0).default(0),
    q: z.string().optional(),
    estado: z.nativeEnum(EstadoCotizacion).optional(),
    cliente_id: z.string().uuid().optional(),
});
