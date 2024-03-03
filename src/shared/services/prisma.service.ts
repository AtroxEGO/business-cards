import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  logger = new Logger();
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      this.logger.error(e);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
