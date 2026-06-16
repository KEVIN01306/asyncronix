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
    total:       z.coerce.number().int().nonnegative().optional().nullable(),
    MetodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']),
});

export type ServicioFormValues = z.infer<typeof servicioSchema>;
