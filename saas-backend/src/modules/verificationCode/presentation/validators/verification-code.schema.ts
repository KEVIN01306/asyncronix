import { z } from 'zod';

export const verificarCodigoSchema = z.object({
  code: z.string().length(6, 'El código debe tener exactamente 6 caracteres'),
});
