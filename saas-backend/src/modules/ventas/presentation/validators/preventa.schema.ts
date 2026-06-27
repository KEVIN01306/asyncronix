import { z } from "zod";
import { MetodoPago } from "@prisma/client";

export const preVentaDetalleInputSchema = z.object({
    variante_id: z.string().uuid("Variante inválida"),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
    precio: z.number().nonnegative("El precio no puede ser negativo").optional(),
    descripcion: z.string().trim().optional().default("")
});

export const preVentaCrearSchema = z.object({
    sucursal_id: z.string().uuid("Sucursal inválida").optional(),
    cliente_id: z.string().uuid("ID de cliente inválido").optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    items: z.array(preVentaDetalleInputSchema).min(1, "Debe incluir al menos un producto")
});

export const preVentaCantidadSchema = z.object({
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0")
});

export const preVentaFinalizarSchema = z.object({
    metodo_pago: z.nativeEnum(MetodoPago).optional().default(MetodoPago.EFECTIVO),
    comentarios: z.string().trim().optional().nullable(),
    override_stock: z.boolean().optional().default(false),
    pin_caja: z.string().trim().optional().nullable(),
    efectivo_recibido: z.number().nonnegative().optional().nullable(),
    vuelto: z.number().nonnegative().optional().nullable()
});

export const pinCajaSchema = z.object({
    pin_caja: z.string().trim()
});
