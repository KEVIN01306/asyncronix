import { z } from 'zod';

export const loteSchema = z.object({
    producto_id: z.string().min(1, 'El producto es requerido'),
    variante_id: z.string().min(1, 'La variante es requerida'),
    sucursal_id: z.string().min(1, 'La sucursal es requerida'),
    proveedor_id: z.string().min(1, 'El proveedor es requerido'),
    cantidad_inicial: z
        .number({ message: 'La cantidad inicial debe ser un número' })
        .min(0, 'La cantidad inicial no puede ser negativa'),
    cantidad_actual: z
        .number({ message: 'La cantidad actual debe ser un número' })
        .min(0, 'La cantidad actual no puede ser negativa'),
    costo_compra: z
        .number({ message: 'El costo de compra debe ser un número' })
        .min(0, 'El costo de compra debe ser mayor o igual a 0'),
    precio_venta: z
        .number({ message: 'El precio de venta debe ser un número' })
        .min(0, 'El precio de venta debe ser mayor o igual a 0'),
    fecha_vencimiento: z.string().optional(),
});

export type LoteFormValues = z.infer<typeof loteSchema>;
