import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  Redirect,
  Res,
  UsePipes,
} from '@nestjs/common';
import { LoginDto, LoginResponseDto, loginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @Header('Cache-Control', 'no-cache')
  @ApiCreatedResponse({
    type: LoginResponseDto,
  })
  @UsePipes(new ValidationPipe(loginSchema))
  login(
    @Res({ passthrough: true }) response: Response,
    @Body() loginDto: LoginDto,
  ) {
    return this.authService.login(response, loginDto);
  }

  @Get('/google/login')
  loginByGoogle() {
    return this.authService.initLoginByGoogle();
  }

  @Get('/google/oauth')
  @Redirect()
  loginByGoogleOAuth(
    @Res({ passthrough: true }) response: Response,
    @Query('code') code: string,
  ) {
    return this.authService.loginByGoogleOAuth(response, code);
  }
}
