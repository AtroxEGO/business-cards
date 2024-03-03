import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { LoginDto, LoginResponseDto, loginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiCreatedResponse({
    type: LoginResponseDto,
  })
  @UsePipes(new ValidationPipe(loginSchema))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
