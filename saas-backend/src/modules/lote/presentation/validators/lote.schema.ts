import { z } from "zod";

export const loteSchema = z.object({
    variante_id: z.string().uuid(),
    sucursal_id: z.string().uuid(),
    proveedor_id: z.string().uuid(),
    fecha_vencimiento: z.string().optional(),
    cantidad_inicial: z.number().int().nonnegative(),
    cantidad_actual: z.number().int().nonnegative(),
    costo_compra: z.number().positive(),
    precio_venta: z.number().positive(),
});

export const loteCrearSchema = loteSchema;