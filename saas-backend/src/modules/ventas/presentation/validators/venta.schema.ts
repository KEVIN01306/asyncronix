import { z } from "zod";
import { EstadoVenta, MetodoPago } from "@prisma/client";

const productoInputSchema = z.object({
    variante_id: z.string().min(1, "El id de la variante es obligatorio"),
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

export const buscarScannerSchema = z.object({
    q: z.string().min(1, "El valor de búsqueda es obligatorio").optional(),
    sku: z.string().min(1, "El valor de búsqueda es obligatorio").optional()
}).refine((data) => !!data.q || !!data.sku, {
    message: "El valor de búsqueda es obligatorio",
    path: ['q']
}).transform((data) => ({ q: data.q ?? data.sku! }));

export const ventaDetalleCodigoSchema = z.object({
    sucursal_id: z.string().uuid("Sucursal inválida"),
    codigo: z.string().min(1, "El código es obligatorio"),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0").optional().default(1)
});

export const ventaDetalleSkuSchema = z.object({
    sucursal_id: z.string().uuid("Sucursal inválida"),
    sku: z.string().min(1, "El SKU es obligatorio"),
    cantidad: z.number().int().positive("La cantidad debe ser mayor a 0").optional().default(1)
});
