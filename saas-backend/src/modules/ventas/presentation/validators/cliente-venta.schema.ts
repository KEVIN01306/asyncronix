import { z } from "zod";

export const buscarClienteNitVentaSchema = z.object({
    nit: z.string().min(1, "El NIT es obligatorio").max(50, "El NIT no puede exceder 50 caracteres")
});

export const crearClienteVentaSchema = z.object({
    nombre: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre no puede exceder 100 caracteres"),
    nit: z.string().min(1, "El NIT es obligatorio").max(50, "El NIT no puede exceder 50 caracteres")
});
