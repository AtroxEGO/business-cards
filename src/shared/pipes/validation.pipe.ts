import { BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  private readonly logger = new Logger(ValidationPipe.name);

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.flatten().fieldErrors;
        if (process.env.NODE_ENV === 'development') {
          this.logger.warn(errors);
        }
        throw new BadRequestException({ message: 'Validation Failed', errors });
      }

      throw new BadRequestException('Validation Failed');
    }
  }
}
