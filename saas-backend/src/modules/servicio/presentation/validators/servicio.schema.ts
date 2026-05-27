import { z } from "zod";
import { ESTADO_SERVICIO_VALUES, METODO_PAGO_VALUES } from "../../domain/servicio.constants.js";

const estadoServicioEnum = z.enum(ESTADO_SERVICIO_VALUES as [string, ...string[]]);
const metodoPagoEnum = z.enum(METODO_PAGO_VALUES as [string, ...string[]]);

export const servicioCrearSchema = z.object({
    sucursal_id: z.string().uuid(),
    vehiculo_id: z.string().uuid(),
    cliente_id: z.string().uuid().optional().nullable(),
    mecanico_id: z.string().uuid().optional().nullable(),
    tipo_servicio_id: z.string().uuid().optional().nullable(),
    descripcion: z.string().optional().nullable(),
    kilometraje: z.coerce.number().int().optional().nullable(),
    fecha_salida: z.string().datetime().optional().nullable(),
    total: z.coerce.number().nonnegative().optional().nullable(),
    estado: estadoServicioEnum.optional(),
    MetodoPago: metodoPagoEnum.optional()
});

export const servicioActualizarSchema = servicioCrearSchema.partial();

export const servicioTareaActualizarSchema = z.object({
    nombre: z.string().optional(),
    completado: z.boolean().optional(),
    observacion: z.string().optional().nullable()
});

export const servicioCambiarEstadoSchema = z.object({
    estado: estadoServicioEnum
});

export const servicioListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    estado: estadoServicioEnum.optional()
});

export const asociarMecanicoSchema = z.object({
    mecanico_id: z.string().uuid()
});

export const cambiarMecanicoSchema = z.object({
    mecanicoAnteriorId: z.string().uuid(),
    mecanicoNuevoId: z.string().uuid()
});
