import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getSessionToken({ id, email }) {
    const tokenPayload = {
      sub: id,
      email,
    };

    return await this.jwtService.signAsync(tokenPayload, {
      expiresIn: this.configService.get('sessionToken.expiration'),
    });
  }
}
