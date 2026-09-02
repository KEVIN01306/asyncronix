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
    diagnostico: z.string().optional().nullable(),
    kilometraje: z.coerce.number().int().optional().nullable(),
    kilometraje_proximo: z.coerce.number().int().optional().nullable(),
    fecha_salida: z.string().datetime().optional().nullable(),
    subtotal: z.coerce.number().nonnegative().optional().nullable(),
    total: z.coerce.number().nonnegative().optional().nullable(),
    estado: estadoServicioEnum.optional(),
    MetodoPago: metodoPagoEnum.optional()
});

export const servicioActualizarSchema = servicioCrearSchema.partial();

export const servicioTareaCrearSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre de la tarea es requerido'),
    extra: z.boolean().optional()
});

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
    estado: estadoServicioEnum.optional(),
    codigo: z.string().trim().optional(),
    placa: z.string().trim().optional(),
    q: z.string().trim().optional(),
    mecanico_id: z.string().uuid().optional()
});

export const servicioSalidaSchema = z.object({
    metodo_pago: metodoPagoEnum,
    efectivo_recibido: z.coerce.number().nonnegative().optional().nullable(),
    vuelto: z.coerce.number().nonnegative().optional().nullable(),
    caja_id: z.string().uuid().optional().nullable(),
    token_autorizado: z.string().optional().nullable(),
    forzar_caja_en_linea: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional().nullable(),
    cuenta_bancaria_id: z.string().uuid().optional().nullable(),
    monto_original: z.coerce.number().nonnegative().optional().nullable(),
    moneda_id: z.string().uuid().optional().nullable()
}).superRefine((data, ctx) => {
    if (data.metodo_pago !== 'EFECTIVO') {
        return;
    }

    if (data.efectivo_recibido == null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El efectivo recibido es obligatorio cuando el método de pago es EFECTIVO',
            path: ['efectivo_recibido']
        });
    }

    if (data.vuelto == null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El vuelto es obligatorio cuando el método de pago es EFECTIVO',
            path: ['vuelto']
        });
    }
});

export const repuestoClienteCrearSchema = z.object({
    nombre: z.string().trim().min(1),
    cantidad: z.coerce.number().int().min(1)
});

export const repuestoCrearSchema = z.object({
    variante_id: z.string().uuid().optional(),
    codigo: z.string().trim().optional(),
    cantidad: z.coerce.number().int().min(1),
    sucursal_id: z.string().uuid()
}).refine((data) => Boolean(data.variante_id || data.codigo), {
    message: 'Se requiere variante_id o codigo',
    path: ['variante_id']
});

export const asociarMecanicoSchema = z.object({
    mecanico_id: z.string().uuid()
});

export const servicioObservacionesSchema = z.object({
    observaciones: z.string().max(500, 'Las observaciones no pueden exceder 500 caracteres').nullable().optional()
});

export const cambiarMecanicoSchema = z.object({
    mecanicoAnteriorId: z.string().uuid(),
    mecanicoNuevoId: z.string().uuid()
});

export const clienteExternoSchema = z.object({
    nombre_extra: z.string().trim().min(1),
    documento_extra: z.string().trim().min(1),
    numero_extra: z.string().trim().min(1)
});

export const cambioSiguienteServicioCrearSchema = z.object({
    item: z.string().trim().min(1, 'El item es requerido').max(100, 'El item no puede exceder 100 caracteres')
});

export const mandarReparacionSchema = z.object({
    firma_entrada: z.string().trim().min(1, 'La firma de entrada es requerida')
});

export const actualizarReparacionSchema = z.object({
    total: z.coerce.number().nonnegative('El total no puede ser negativo').optional(),
    descripcion: z.string().trim().optional()
});

export const actualizarCustodiaSchema = z.object({
    total: z.coerce.number().nonnegative('El total no puede ser negativo').optional(),
    descripcion: z.string().trim().optional().nullable()
});

export const repuestoReparacionSchema = z.object({
    descripccion: z.string().trim().min(1, 'La descripción es requerida'),
    cantidad: z.coerce.number().int().min(1, 'La cantidad debe ser mayor a 0'),
    instrucciones: z.string().trim().optional().default(''),
    procedencia: z.enum(['PROPIO', 'CLIENTE']),
    entregado: z.boolean().optional().default(false)
});

export const actualizarRepuestoReparacionSchema = repuestoReparacionSchema.partial();
