import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from '../shared/services/token.service';

@Module({
  imports: [ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, TokenService],
})
export class UsersModule {}
