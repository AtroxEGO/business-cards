import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const invalidColorMessage = 'Musts be in HEX';

export const patchCardSchema = z.object({
  fullName: z.ostring(),
  jobTitle: z.ostring(),
  address: z.ostring(),
  primaryColor: z
    .ostring()
    .refine(
      (color) => (color ? color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/) : true),
      invalidColorMessage,
    ),
  secondaryColor: z
    .ostring()
    .refine(
      (color) => (color ? color.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/) : true),
      invalidColorMessage,
    ),
  bio: z.ostring(),
});

export class PatchCardDto extends createZodDto(patchCardSchema) {}
