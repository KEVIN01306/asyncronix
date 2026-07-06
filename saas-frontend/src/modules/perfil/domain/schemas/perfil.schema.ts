import { z } from 'zod';

export const perfilUpdateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().optional().nullable().transform((v) => v ?? ''),
  email: z.union([z.string().email('Email inválido'), z.literal(''), z.null()]).optional(),
  telefono: z.string().optional().nullable().transform((v) => v ?? ''),
});

export type PerfilUpdateFormValues = z.infer<typeof perfilUpdateSchema>;

export const cambiarPasswordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm_password: z.string().min(6, 'La confirmación debe tener al menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export type CambiarPasswordFormValues = z.infer<typeof cambiarPasswordSchema>;


export const actualizarPinCajaSchema = z.object({
  pin_caja: z.string().regex(/^[0-9]{4,6}$/, { message: 'El pin debe contener entre 4 y 6 dígitos' }),
});

export type ActualizarPinCajaFormValues = z.infer<typeof actualizarPinCajaSchema>;

export const actualizarPinModeloSchema = z.object({
  pin_modelo: z.string().regex(/^[0-9]{4,6}$/, { message: 'El pin debe contener entre 4 y 6 dígitos' }),
});

export type ActualizarPinModeloFormValues = z.infer<typeof actualizarPinModeloSchema>;

export const actualizarPinSucursalSchema = z.object({
  pin_sucursal: z.string().regex(/^[0-9]{4,6}$/, { message: 'El pin debe contener entre 4 y 6 dígitos' }),
});

export type ActualizarPinSucursalFormValues = z.infer<typeof actualizarPinSucursalSchema>;
