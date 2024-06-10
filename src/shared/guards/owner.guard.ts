import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { CardsService } from '../../cards/cards.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private cardsService: CardsService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private async validateRequest(request: Request) {
    const requestedID = await this.getCardID(request.params.cardID);
    const sessionToken = request.cookies['sessionToken'];
    const { sub: userID } =
      await this.tokenService.extractPayloadFromToken(sessionToken);
    console.log(`Checking in guard if is owner: ${requestedID}, ${userID}`);
    return requestedID === userID;
  }

  async getCardID(param: string) {
    const { id } = await this.cardsService.getCard(param);
    return id;
  }
}
