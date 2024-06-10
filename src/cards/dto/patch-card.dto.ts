import { createZodDto } from '@anatine/zod-nestjs';
import { ValidationErrorsCodes } from '../../shared/errors/errorCodes';
import { z } from 'zod';

const phoneRegex = new RegExp(
  /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-s./0-9]{8,15}$/,
);

const urlRegex = new RegExp(
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
);

export const AllowedSocials = [
  'facebook',
  'youtube',
  'linkedin',
  'instagram',
  'email',
  'website',
  'phone',
] as const;

export const patchCardSchema = z
  .object({
    fullName: z.ostring(),
    jobTitle: z.ostring(),
    address: z.ostring(),
    primaryColor: z
      .ostring()
      .refine(
        (color) => (color ? color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/) : true),
        ValidationErrorsCodes.INVALID_COLOR,
      ),
    secondaryColor: z
      .ostring()
      .refine(
        (color) => (color ? color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/) : true),
        ValidationErrorsCodes.INVALID_COLOR,
      ),
    bio: z.ostring().nullable(),
    socials: z.optional(
      z.array(
        z.object({
          socialName: z.enum(AllowedSocials),
          value: z.string(),
        }),
      ),
    ),
  })
  .superRefine((data) => {
    if (data.socials) {
      data.socials.forEach(({ socialName, value }) => {
        switch (socialName) {
          case 'email':
            return z
              .string()
              .email(ValidationErrorsCodes.INVALID_EMAIL)
              .parse(value, { path: [`socials.${socialName}`] });
          case 'phone':
            return z
              .string()
              .regex(phoneRegex, ValidationErrorsCodes.INVALID_PHONE)
              .parse(value, { path: [`socials.${socialName}`] });
          default:
            return z
              .string()
              .regex(urlRegex, ValidationErrorsCodes.INVALID_LINK)
              .parse(value, { path: [`socials.${socialName}`] });
        }
      });
    }
  });

export class PatchCardDto extends createZodDto(patchCardSchema) {}
