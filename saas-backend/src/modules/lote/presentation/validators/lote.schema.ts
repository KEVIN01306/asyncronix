import { z } from "zod";

export const loteSchema = z.object({
    producto_id: z.string().uuid(),
    sucursal_id: z.string().uuid(),
    cantidad_actual: z.number().int().nonnegative(),
    costo_compra: z.number().positive(),
    precio_venta: z.number().positive(),
});

export const loteCrearSchema = loteSchema;