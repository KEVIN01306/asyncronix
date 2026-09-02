import { z } from 'zod';

export const servicioSchema = z.object({
    placa: z.string().trim().min(1, 'La placa es requerida'),
    vehiculo_id: z.string().uuid().optional(),
    cliente_id: z.string().uuid().optional().nullable(),
    tipo_servicio_id: z.string().uuid({ message: 'Selecciona un tipo de servicio' }),
    descripcion: z.string().optional().nullable(),
    diagnostico: z.string().optional().nullable(),
    kilometraje: z.coerce.number().int().nonnegative().optional().nullable(),
    kilometraje_proximo: z.coerce.number().int().nonnegative().optional().nullable(),
    subtotal:    z.coerce.number().int().nonnegative().optional().nullable(),
    total:       z.coerce.number().int().nonnegative().optional().nullable(),
    MetodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']),
});

export const servicioTareaCrearSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre de la tarea es requerido'),
    extra: z.boolean().optional()
});

export const cambioSiguienteServicioCrearSchema = z.object({
    item: z.string().trim().min(1, 'El item es requerido').max(100, 'El item no puede exceder 100 caracteres')
});

export type ServicioFormValues = z.infer<typeof servicioSchema>;
