import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { LoginDto, loginSchema } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe(loginSchema))
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
