import {
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from '../shared/services/google-auth.service';
import { CreateExternalUserDto, UsersService } from '../users/users.service';
import { Response } from 'express';
import { TokenService } from '../shared/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private googleAuthService: GoogleAuthService,
  ) {}

  googleAuthRedirectUrl =
    this.configService.get('api.baseUrl') + '/auth/google/oauth';

  async login(response: Response, payload: LoginDto) {
    const { email, password } = payload;
    const user = await this.userService.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const sessionToken = await this.tokenService.getSessionToken(user);

    response.cookie('sessionToken', sessionToken);

    return;
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

    return { status: 'success', url: authorizeUrl };
  }

  async loginByGoogleOAuth(response: Response, code: string) {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_SECRET_KEY,
      this.googleAuthRedirectUrl,
    );

    if (!code) {
      return { url: this.configService.get('app.baseUrl') + '/sign-in' };
    }

    try {
      const res = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(res.tokens);
      const googleAccessToken = oAuth2Client.credentials.access_token;
      const userData =
        await this.googleAuthService.getUserData(googleAccessToken);
      const user = await this.userService.getUserByEmail(userData.email);

      if (user) {
        const userSessionToken = await this.tokenService.getSessionToken(user);
        response.cookie('sessionToken', userSessionToken);
        return;
      }

      console.log(`Account doesn't exist yet, creating...`);

      const newUserData: CreateExternalUserDto = {
        externalId: userData.sub,
        email: userData.email,
        cardData: { fullName: userData.name, photoUrl: userData.picture },
      };

      const createdUser =
        await this.userService.createExternalUser(newUserData);

      const sessionToken = await this.tokenService.getSessionToken(createdUser);
      response.cookie('sessionToken', sessionToken);
      return;
    } catch (error) {
      throw error;
    }
  }
}
