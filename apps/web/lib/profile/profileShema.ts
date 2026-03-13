import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email("L'adresse e-mail est invalide"),
  location: z.string().min(1, 'Le lieu est requis'),
  phoneNumber: z.string().min(1, 'Le téléphone est requis'),
});

export type ProfileFormInput = z.infer<typeof profileSchema>;
