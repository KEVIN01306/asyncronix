import { z } from "zod";

export const sucursalSchema = z.object({
    id: z.string().max(36),
    negocio_id: z.string().max(36),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    direccion: z.string().min(3, "La direccion debe tener al menos 3 caracteres").nullable(),
    codigo_establecimiento: z.string().min(1, "Requerido").default("1"),
    codigo_postal: z.string().nullable().optional(),
    division_nivel2_id: z.string().uuid().nullable().optional(),
});

export const sucursalCrearSchema = sucursalSchema.omit({ id: true, negocio_id: true});

export const sucursalActualizarSchema = sucursalCrearSchema.partial();

export const sucursalCuentaBancariaAsignarSchema = z.object({
    cuenta_bancaria_id: z.string().uuid('Cuenta bancaria inválida'),
    metodo_pago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OTRO']),
});
