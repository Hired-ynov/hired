import { z } from 'zod';

export const offerSchema = z.object({
  title: z
    .string()
    .min(3, 'Veuillez fournir un titre valide (au moins 3 caractères)'),
  description: z
    .string()
    .min(
      30,
      'Veuillez fournir une description plus détaillée (au moins 30 caractères)',
    ),
  location: z.string().min(2, 'Veuillez indiquer un lieu valide'),
  salaryRange: z
    .object({
      min: z.number().min(0, 'Le salaire minimum doit être positif'),
      max: z.number().min(0, 'Le salaire maximum doit être positif'),
    })
    .refine((data) => data.max >= data.min, {
      message: 'Le salaire maximum doit être supérieur ou égal au minimum',
      path: ['max'],
    })
    .optional(),
  skills: z
    .array(z.string())
    .min(1, 'Veuillez ajouter au moins une compétence'),
});

export type OfferFormInput = z.infer<typeof offerSchema>;
