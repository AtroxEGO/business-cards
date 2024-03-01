import { Injectable } from '@nestjs/common';
import { PrismaService } from './shared/services/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}
  async checkHealth(): Promise<any> {
    let status = 'ok';
    try {
      await this.prismaService.$executeRaw`SELECT 1`;
    } catch {
      status = 'down';
    }

    return { status };
  }
}
