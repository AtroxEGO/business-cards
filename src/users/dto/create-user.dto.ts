import { createZodDto } from '@anatine/zod-nestjs';
import { ValidationErrorsCodes } from '../../shared/errors/errorCodes';
import { z } from 'zod';

const lowerCaseRegex = /[a-z]/;
const upperCaseRegex = /[A-Z]/;
const numberRegex = /\d/;
const lengthRegex = /.{8,}/;

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .regex(lengthRegex, ValidationErrorsCodes.PASSWORD_TOO_SHORT)
      .regex(upperCaseRegex, ValidationErrorsCodes.PASSWORD_UPPER_CASE_REQUIRED)
      .regex(numberRegex, ValidationErrorsCodes.PASSWORD_NUMBER_REQUIRED)
      .regex(
        lowerCaseRegex,
        ValidationErrorsCodes.PASSWORD_LOWER_CASE_REQUIRED,
      ),
    confirm: z.string(),
  })
  .required()
  .refine(({ password, confirm }) => password === confirm, {
    path: ['confirm'],
    message: ValidationErrorsCodes.PASSWORD_DO_NOT_MATCH,
  });

export class CreateUserDto extends createZodDto(createUserSchema) {}
export const CreateUserResponseZ = z.object({
  sessionToken: z.string(),
});
export class CreateUserResponseDto extends createZodDto(CreateUserResponseZ) {}
