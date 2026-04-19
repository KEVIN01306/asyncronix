import z from "zod";
import { CategoriaGasto } from "../../domain/gastos_categoria.enum.js";

export const gastoSchema = z.object({
    id: z.string().uuid(),
    negocio_id: z.string().uuid(),
    sucursal_id: z.string().uuid(),
    monto: z.number().positive(),
    descripcion: z.string().max(255).nullable(),
    categoria_gasto: z.nativeEnum(CategoriaGasto),
    fecha: z.string().or(z.date())
})

export const gastoCrearSchema = gastoSchema.omit({ id: true, negocio_id: true, fecha: true })

export const gastoActualizarSchema = gastoSchema.omit({ id: true, negocio_id: true }).partial()

export const gastoListarQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    offset: z.coerce.number().min(0).optional().default(0),
    sucursal_ids: z.preprocess((val) => {
        if (typeof val === 'string') return [val];
        return val;
    }, z.array(z.string().uuid())).optional()
})

