import { z } from "zod";
import { EstadoVenta, MetodoPago } from "@prisma/client";

const productoInputSchema = z.object({
    producto_id: z.string().min(1, "El id del producto es obligatorio"),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0")
});

export const ventaCrearSchema = z.object({
    sucursal_id: z.string().uuid("Sucursal inválida"),
    cliente_id: z.string().uuid("ID de cliente inválido").optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    estado: z.nativeEnum(EstadoVenta).optional().default(EstadoVenta.PENDIENTE),
    metodo_pago: z.nativeEnum(MetodoPago, { required_error: "El método de pago es obligatorio" }),
    productos: z.array(productoInputSchema).min(1, "Debe incluir al menos un producto")
});

export const ventaActualizarSchema = z.object({
    sucursal_id: z.string().uuid("Sucursal inválida"),
    cliente_id: z.string().uuid("ID de cliente inválido").optional().nullable().or(z.literal("")).transform(v => v === "" ? null : v),
    estado: z.nativeEnum(EstadoVenta).optional(),
    metodo_pago: z.nativeEnum(MetodoPago).optional(),
    productos: z.array(productoInputSchema).optional()
});
