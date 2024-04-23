import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { LoginDto, LoginResponseDto, loginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiCreatedResponse({
    type: LoginResponseDto,
  })
  @UsePipes(new ValidationPipe(loginSchema))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('/google/login')
  loginByGoogle() {
    return this.authService.initLoginByGoogle();
  }

  @Get('/google/oauth')
  // @Redirect('http://localhost:4200', 301)
  loginByGoogleOAuth(@Query('code') code: string) {
    return this.authService.loginByGoogleOAuth(code);
  }
}
