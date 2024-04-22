import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const passwordComplexityMessage =
  "Password doesn't meet the complexity requirements";

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().regex(passwordRegex, passwordComplexityMessage),
    confirm: z.string().regex(passwordRegex, passwordComplexityMessage),
  })
  .required()
  .refine(({ password, confirm: confirm }) => password === confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

export class CreateUserDto extends createZodDto(createUserSchema) {}
export const CreateUserResponseZ = z.object({
  access_token: z.string(),
});
export class CreateUserResponseDto extends createZodDto(CreateUserResponseZ) {}
