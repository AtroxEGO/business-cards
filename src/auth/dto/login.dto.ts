import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .required();

export class LoginDto extends createZodDto(loginSchema) {}
export const LoginResponseZ = z.object({
  access_token: z.string(),
});
export class LoginResponseDto extends createZodDto(LoginResponseZ) {}
