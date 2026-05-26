import { z } from 'zod';

export const guardarTokenNotificacionSchema = z.object({

    token: z.string().min(10, 'Token inválido'),

});

export type GuardarTokenNotificacionRequest = z.infer<typeof guardarTokenNotificacionSchema>;
