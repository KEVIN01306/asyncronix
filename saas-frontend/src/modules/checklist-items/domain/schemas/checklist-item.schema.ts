import z from 'zod';

export const checklistItemSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
});

export type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>;
