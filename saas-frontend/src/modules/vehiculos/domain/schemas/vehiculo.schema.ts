import { z } from 'zod';

export const vehiculoSchema = z.object({
    modelo_id: z.string().uuid('Selecciona un modelo válido'),
    vehiculo_tipo_id: z.string().uuid('Selecciona un tipo de vehículo válido'),
    placa: z.string().min(1, 'La placa es obligatoria').max(30, 'La placa no puede superar los 30 caracteres'),
});

export type VehiculoFormValues = z.infer<typeof vehiculoSchema>;
