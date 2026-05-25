import { z } from "zod";

const estadoServicioEnum = z.enum([
    'RECEPCION',
    'EN_SERVICIO',
    'EN_DIAGNOSTICO',
    'ESPERA_REPUESTOS',
    'EN_REPARACION',
    'LISTO_ENTREGA',
    'FINALIZADO',
    'CANCELADO'
]);

const metodoPagoEnum = z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']);

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

export const servicioCambiarEstadoSchema = z.object({
    estado: estadoServicioEnum
});

export const servicioListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    estado: estadoServicioEnum.optional()
});
