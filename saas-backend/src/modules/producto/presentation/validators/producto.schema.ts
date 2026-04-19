import { z } from "zod";

export const productoSchema = z.object({
    id: z.string().uuid(),
    negocio_id: z.string().uuid(),
    categoria_id: z.string().uuid().nullable(),
    nombre: z.string().max(150),
    descripcion: z.string().nullable(),
});

export const productoCrearSchema = productoSchema.omit({ id: true, negocio_id: true });

export const productoActualizarSchema = productoSchema.omit({ id: true, negocio_id: true }).partial();

export const productoListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    categoria_id: z.string().uuid().optional(),
});

// Image schemas
export const productoImagenActualizarSchema = z.object({
    es_principal: z.boolean().optional(),
    sku_id: z.string().uuid().nullable().optional(),
});

export const productoBulkEliminarSchema = z.object({
    ids: z.array(z.string().uuid()).min(1),
});
