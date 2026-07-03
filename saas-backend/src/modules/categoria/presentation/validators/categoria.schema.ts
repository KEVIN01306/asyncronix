import z from "zod";

export const categoriaSchema = z.object({
    id: z.string().uuid(),
    negocio_id: z.string().uuid(),
    categoria: z.string().max(100),
    categoria_padre_id: z.string().uuid(),
});

export const categoriaCrearSchema = categoriaSchema.omit({ id: true, negocio_id: true });

export const categoriaActualizarSchema = categoriaSchema.omit({ id: true, negocio_id: true }).partial().extend({
    categoria_padre_id: z.string().uuid()
});