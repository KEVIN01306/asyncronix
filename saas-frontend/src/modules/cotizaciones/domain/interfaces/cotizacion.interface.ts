import { z } from 'zod';

export enum EstadoCotizacion {
    PENDIENTE = 'PENDIENTE',
    ACEPTADA = 'ACEPTADA',
    RECHAZADA = 'RECHAZADA',
    VENCIDA = 'VENCIDA'
}

export enum TipoDestinoCotizacion {
    TALLER = 'TALLER',
    VENTA_DIRECTA = 'VENTA_DIRECTA'
}

export interface CotizacionDetalle {
    id: string;
    cotizacion_id: string;
    variante_id?: string | null;
    tipo_servicio_id?: string | null;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    descuento: number;
    subtotal: number;
}

export interface Cotizacion {
    id: string;
    negocio_id: string;
    sucursal_id: string;
    codigo: string;
    correlativo: number;
    cliente_id?: string | null;
    vehiculo_id?: string | null;
    usuario_id: string;
    estado: EstadoCotizacion;
    fecha_emision: string;
    fecha_validez?: string | null;
    tipo_destino: TipoDestinoCotizacion;
    terminos?: string | null;
    subtotal: number;
    descuento_total: number;
    total: number;
    created_at: string;
    updated_at: string;

    // Relaciones (opcionales dependiendo del fetch)
    cliente?: {
        id: string;
        nombre: string;
        email?: string | null;
        telefono?: string | null;
    } | null;
    vehiculo?: {
        id: string;
        placa: string;
        marca?: { id: string; nombre: string; } | null;
        modelo?: { id: string; nombre: string; } | null;
    } | null;
    usuario?: {
        id: string;
        nombre: string;
    } | null;
    detalles: CotizacionDetalle[];
}

export const cotizacionDetalleFormSchema = z.object({
    id: z.string().optional(),
    variante_id: z.string().nullable().optional(),
    tipo_servicio_id: z.string().nullable().optional(),
    descripcion: z.string().min(1, "La descripción es requerida").max(255),
    cantidad: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
    precio_unitario: z.coerce.number().min(0, "El precio no puede ser negativo"),
    descuento: z.coerce.number().min(0).optional().default(0),
    // Tipo auxiliar para la UI, no se envía al backend si no es necesario,
    // o se procesa antes de enviar.
    tipo: z.enum(['PRODUCTO', 'SERVICIO', 'MANO_OBRA_PERSONALIZADA']).optional()
});

export type CotizacionDetalleForm = z.infer<typeof cotizacionDetalleFormSchema>;

export const cotizacionFormSchema = z.object({
    cliente_id: z.string().nullable().optional(),
    vehiculo_id: z.string().nullable().optional(),
    fecha_validez: z.string().nullable().optional(),
    tipo_destino: z.nativeEnum(TipoDestinoCotizacion),
    terminos: z.string().nullable().optional(),
    detalles: z.array(cotizacionDetalleFormSchema).min(1, "Debe incluir al menos un detalle")
});

export type CotizacionForm = z.infer<typeof cotizacionFormSchema>;

export interface CotizacionResponse {
    data: Cotizacion[];
    meta: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
    };
}

export const convertirCotizacionSchema = z.object({
    metodo_pago: z.string().optional(),
    opcionesCaja: z.object({
        caja_id: z.string().optional(),
        token_autorizado: z.string().optional(),
        forzar_caja_en_linea: z.boolean().optional()
    }).optional()
});

export type ConvertirCotizacionForm = z.infer<typeof convertirCotizacionSchema>;
