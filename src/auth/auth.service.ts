import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(payload: LoginDto) {
    const { email, password } = payload;
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: await this.jwtService.signAsync(tokenPayload),
    };
  }
}
