import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './shared/services/prisma.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Global()
@Module({
  imports: [
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        ttl: 600000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
