import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { CardsService } from '../../cards/cards.service';
import {
  CardAnalyticsService,
  CardVisit,
} from '../services/cardAnalytics.service';

@Injectable()
export class CardAnalyticsMiddleware implements NestMiddleware {
  constructor(
    private tokenService: TokenService,
    private cardsService: CardsService,
    private cardAnalyticsService: CardAnalyticsService,
  ) {}
  logger = new Logger(CardAnalyticsMiddleware.name);

  async use(req: Request, _res: Response, next: NextFunction) {
    // Get ID of person requesting the Card
    const requesterSessionToken = req.cookies['sessionToken'];
    const requesterID = requesterSessionToken
      ? (await this.tokenService.extractPayloadFromToken(requesterSessionToken))
          .sub
      : undefined;
    const cardID = await this.getCardID(req.params.cardID);

    next();
    // Don't count when requester is owner
    if (await this.isOwner(cardID, requesterID)) {
      return;
    }

    const originIP =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

    const countryCode = await this.getCountryCode(originIP.split(',')[0]);

    this.logger.debug(
      `
      Card requested:
      - IP: ${originIP}
      - Country Code: ${countryCode}
      - CardID: ${cardID}
      - Requester ID: ${requesterID}
      `,
    );

    const cardVisitData: CardVisit = {
      cardID,
      requesterID,
      originIP,
      countryCode,
    };

    //Last visit from IP on this card (1h cooldown)
    if (await this.cardAnalyticsService.isOnCooldown(cardVisitData)) {
      this.logger.debug('Requester is on cooldown!');
      return;
    }

    this.cardAnalyticsService.addCardVisit(cardVisitData);
  }

  async getCardID(param: string) {
    const { id } = await this.cardsService.getCard(param);
    return id;
  }

  async getCountryCode(ip: string) {
    const ipLookup = await (await fetch(`http://ip-api.com/json/${ip}`)).json();

    return ipLookup.countryCode || 'Unknown';
  }

  async isOwner(cardID: string, userID: string) {
    if (cardID === userID) return true;

    return false;
  }
}
