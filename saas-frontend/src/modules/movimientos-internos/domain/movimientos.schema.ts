import { z } from 'zod';

export const movimientoInternoSchema = z.object({
    origen_entidad: z.enum(['CAJA', 'CUENTA']),
    origen_id: z.string().uuid("Seleccione una entidad de origen válida"),
    destino_entidad: z.enum(['CAJA', 'CUENTA']),
    destino_id: z.string().uuid("Seleccione una entidad de destino válida"),
    monto_original: z.number({ error: "El monto debe ser un número válido" }).positive("El monto debe ser mayor a 0"),
    descripcion: z.string().min(1, "La descripción es requerida"),
}).refine(data => {
    return !(data.origen_entidad === data.destino_entidad && data.origen_id === data.destino_id);
}, {
    message: "La entidad de origen y destino no pueden ser la misma",
    path: ["destino_id"]
});

export type MovimientoInternoFormValues = z.infer<typeof movimientoInternoSchema>;
