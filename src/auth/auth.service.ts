import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from '../shared/services/google-auth.service';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private googleAuthService: GoogleAuthService,
  ) {}

  googleAuthRedirectUrl =
    this.configService.get('api.baseUrl') + '/auth/google/oauth';

  async login(payload: LoginDto) {
    const { email, password } = payload;
    const user = await this.userService.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.getSessionToken(user);
  }

  async initLoginByGoogle() {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_SECRET_KEY,
      this.googleAuthRedirectUrl,
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      // access_type:
      // process.env.NODE_ENV === 'development' ? 'offline' : undefined,
      scope:
        'https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/userinfo.email',
      prompt: 'consent',
    });

    return { status: 'ok', url: authorizeUrl };
  }

  async loginByGoogleOAuth(code: string) {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_SECRET_KEY,
      this.googleAuthRedirectUrl,
    );

    try {
      const res = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(res.tokens);
      const accessToken = oAuth2Client.credentials.access_token;
      const userData = await this.googleAuthService.getUserData(accessToken);
      console.log(userData);

      const user = await this.userService.getUserByEmail(userData.email);

      if (user) {
        return await this.getSessionToken(user);
      }

      return { message: 'account doesnt exist yet!' };
    } catch (error) {
      throw error;
    }
  }

  async getSessionToken({ id, email }) {
    const tokenPayload = {
      sub: id,
      email: email,
    };

    return {
      accessToken: await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '1h',
      }),
    };
  }
}
