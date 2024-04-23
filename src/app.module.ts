import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './shared/services/prisma.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CardsModule } from './cards/cards.module';
import { APP_GUARD } from '@nestjs/core';
import { StorageService } from './shared/services/storage.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleAuthService } from './shared/services/google-auth.service';
import configuration from './config/configuration';

@Global()
@Module({
  imports: [
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    CardsModule,
    ConfigModule.forRoot({ load: [configuration] }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    StorageService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    GoogleAuthService,
  ],
  exports: [PrismaService, StorageService],
})
export class AppModule {}
