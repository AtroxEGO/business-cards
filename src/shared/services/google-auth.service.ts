import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthService {
  async getUserData(accessToken: string) {
    console.log(accessToken);
    const oAuthUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`;
    const response = await fetch(oAuthUrl);
    const data = await response.json();
    return data;
  }
}
