import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordComplexityMessage =
  "Password doesn't meet the complexity requirements";

export const createUserSchema = z
  .object({
    fullName: z.string({
      description: "User's full name",
    }),
    email: z.string().email(),
    password: z.string().regex(passwordRegex, passwordComplexityMessage),
    confirm: z.string().regex(passwordRegex, passwordComplexityMessage),
  })
  .required()
  .refine(({ password, confirm: confirm }) => password === confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

export type CreateUserDto = z.infer<typeof createUserSchema>;
