import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .optional(),
  skills: z.array(z.string()).optional(),
});

export type ProfileFormInput = z.infer<typeof profileSchema>;
