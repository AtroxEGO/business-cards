import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type TokenPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async verifySessionToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async getSessionToken({ id, email }) {
    const tokenPayload = {
      sub: id,
      email,
    };

    return await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: this.configService.get('sessionToken.expiration'),
    });
  }

  async extractPayloadFromToken(token: string): Promise<TokenPayload> {
    if (!token) throw new Error('Token is Empty');

    const payload = await this.jwtService.decode(token.replace('Bearer ', ''));

    return payload;
  }

  getCookieDomain() {
    if (process.env.NODE_ENV === 'development') {
      return 'localhost';
    }

    const frontendUrl = this.configService.get('app.baseUrl') as string;
    console.log(frontendUrl.split('.').slice(-2).join('.'));
    return frontendUrl.split('.').slice(-2).join('.');
  }
}
