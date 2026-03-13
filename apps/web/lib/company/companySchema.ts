import { z } from 'zod';

export const companySchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'entreprise ne doit pas dépasser 100 caractères"),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description ne doit pas dépasser 1000 caractères')
    .optional(),
  website: z
    .string()
    .url("L'URL du site web doit être valide")
    .optional()
    .or(z.literal('')),
});

export type CompanyFormInput = z.infer<typeof companySchema>;
