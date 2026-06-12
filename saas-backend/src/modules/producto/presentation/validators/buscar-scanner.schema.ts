import { z } from "zod";

export const buscarScannerSchema = z.object({
    q: z.string().min(1, "El valor de búsqueda es obligatorio").optional(),
    codigo: z.string().min(1, "El valor de búsqueda es obligatorio").optional(),
    sku: z.string().min(1, "El valor de búsqueda es obligatorio").optional()
}).refine((data) => !!data.q || !!data.codigo || !!data.sku, {
    message: "El valor de búsqueda es obligatorio",
    path: ['q']
}).transform((data) => ({ q: data.q ?? data.codigo ?? data.sku! }));
