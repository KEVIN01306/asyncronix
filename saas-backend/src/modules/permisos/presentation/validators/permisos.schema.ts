import z from "zod";

export const permisosRolSchema = z.object({
    permisoIds: z.array(z.string().max(36)),
});
