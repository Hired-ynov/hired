import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Veuillez entrer votre adresse e-mail'),
  password: z.string().min(1, 'Veuillez entrer votre mot de passe'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Champs requis'),
    lastName: z.string().min(1, 'Champs requis'),
    email: z.string().email('Veuillez entrer une adresse e-mail valide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/,
        'Le mot de passe doit contenir une minuscule, une majuscule et un caractère spécial',
      ),
    confirmPassword: z.string().min(8, 'Veuillez confirmer votre mot de passe'),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe ne correspondent pas',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
