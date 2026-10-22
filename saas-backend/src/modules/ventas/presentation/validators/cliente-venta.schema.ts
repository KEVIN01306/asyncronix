import { z } from "zod";

export const buscarClienteNitVentaSchema = z.object({
    nit: z.string().trim().max(50).optional(),
    dpi: z.string().trim().max(50).optional(),
}).refine((data) => Boolean(data.nit || data.dpi), {
    message: "Debe ingresar al menos NIT o DPI",
    path: ["dpi"]
});

export const crearClienteVentaSchema = z.object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
    apellido: z.string().trim().max(100).optional().nullable(),
    dpi: z.string().trim().max(50).optional().nullable(),
    nit: z.string().trim().max(50).optional().nullable(),
    telefono: z.string().trim().max(25).optional().nullable(),
    email: z.union([z.string().trim().email("Formato de correo inválido"), z.literal("")]).optional().nullable(),
});
