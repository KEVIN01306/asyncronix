import z from "zod";

export const categoriaSchema = z.object({
    id: z.string().uuid(),
    negocio_id: z.string().uuid(),
    nombre: z.string().max(50),
    descripcion: z.string().max(255).nullable(),
});

export const categoriaCrearSchema = categoriaSchema.omit({ id: true, negocio_id: true });

export const categoriaActualizarSchema = categoriaSchema.omit({ id: true, negocio_id: true }).partial();

export const categoriaListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
});
