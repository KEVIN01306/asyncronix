import { z } from "zod";

const productoBaseSchema = z.object({
    categoria_id: z.string().uuid({ message: 'Selecciona una categoría válida' }),
    marca_id: z.string().uuid({ message: 'Selecciona una marca válida' }),
    nombre: z.string().min(3, 'El nombre del producto es obligatorio').max(150),
    codigo: z.string().max(100).optional().nullable(),
});

export const productoCrearSchema = productoBaseSchema;
export const productoActualizarSchema = productoBaseSchema;

export const productoAtributosSchema = z.object({
    atributos: z.array(z.string().uuid({ message: 'Selecciona atributos válidos' })).optional().default([])
});

export const productoListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    categoria_id: z.string().uuid().optional(),
});
