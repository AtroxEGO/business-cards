import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const AllowedSocials = [
  'facebook',
  'youtube',
  'linkedin',
  'instagram',
  'email',
  'website',
  'phone',
] as const;

export const patchSocialSchema = z
  .object({
    socials: z
      .array(
        z.object({
          socialName: z.enum(AllowedSocials),
          value: z.union([
            z.string().email('Invalid URL or email'),
            z.string().url('Invalid URL or email'),
          ]),
        }),
      )
      .min(1),
  })
  .required();
export class patchSocialDto extends createZodDto(patchSocialSchema) {}

export const deleteSocialSchema = z.object({
  socialName: z.string(),
});
export class deleteSocialDto extends createZodDto(deleteSocialSchema) {}
