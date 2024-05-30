import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { CardsService } from '../../cards/cards.service';

export type CardVisit = {
  cardID: string;
  requesterID?: string;
  originIP: string;
  countryCode: string;
};

@Injectable()
export class CardAnalyticsService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private cardsService: CardsService,
  ) {}
  logger = new Logger(CardAnalyticsService.name);

  async addCardVisit(cardVisitData: CardVisit) {
    await this.prismaService.cardVisit.create({ data: cardVisitData });
    this.logger.debug('Visit was Created!');
  }

  async getCardAnalytics(cardID: string, scope: string) {
    const scopeDate = this.getScopeDate(scope);
    try {
      const { id: cardUUID } = await this.cardsService.getCard(cardID);

      // Perform all database queries in parallel
      const [total, uniqueVisits, countries] = await Promise.all([
        this.prismaService.cardVisit.count({
          where: {
            cardID: cardUUID,
            ...(scopeDate && { createdAt: { gte: scopeDate } }),
          },
        }),
        this.prismaService.cardVisit.groupBy({
          where: {
            cardID: cardUUID,
            ...(scopeDate && { createdAt: { gte: scopeDate } }),
          },
          by: ['requesterID', 'originIP'],
        }),
        this.prismaService.cardVisit.groupBy({
          where: {
            cardID: cardUUID,
            ...(scopeDate && { createdAt: { gte: scopeDate } }),
          },
          by: ['countryCode'],
          _count: { _all: true },
        }),
      ]);

      const unique = uniqueVisits.length;
      const formattedCountries = countries.map(({ _count, countryCode }) => ({
        count: _count._all,
        countryCode,
      }));

      return {
        visits: {
          total,
          unique,
          countries: formattedCountries,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch card analytics');
    }
  }

  // async getCardAnalytics(cardID: string, scope: string) {
  //   const scopeDate = this.getScopeDate(scope);

  //   const { id: cardUUID } = await this.cardsService.getCard(cardID);

  //   const total = await this.prismaService.cardVisit.count({
  //     where: { cardID: cardUUID, createdAt: { gte: scopeDate } },
  //   });

  //   const uniqueVisits = await this.prismaService.cardVisit.groupBy({
  //     where: { cardID: cardUUID, createdAt: { gte: scopeDate } },
  //     by: ['requesterID', 'originIP'],
  //   });

  //   const unique = uniqueVisits.length;

  //   const countries = (
  //     await this.prismaService.cardVisit.groupBy({
  //       where: { cardID: cardUUID, createdAt: { gte: scopeDate } },
  //       by: ['countryCode'],
  //       _count: { _all: true },
  //     })
  //   ).map(({ _count, countryCode }) => ({ count: _count._all, countryCode }));

  //   const visits = {
  //     total,
  //     unique,
  //     countries,
  //   };

  //   return {
  //     visits,
  //   };
  // }

  getScopeDate(scope: string) {
    const date = new Date();
    const units = {
      d: 'setDate',
      h: 'setHours',
      m: 'setMinutes',
      w: 'setDate', // weeks
      M: 'setMonth', // months
      y: 'setFullYear', // years
    };

    if (!scope) {
      return;
    }

    const unit = scope.slice(-1);
    const value = parseInt(scope.slice(0, -1), 10);

    if (isNaN(value) || !units[unit]) {
      throw new BadRequestException('Invalid scope format.');
    }

    switch (unit) {
      case 'd':
        date.setDate(date.getDate() - value);
        break;
      case 'h':
        date.setHours(date.getHours() - value);
        break;
      case 'm':
        date.setMinutes(date.getMinutes() - value);
        break;
      case 'w':
        date.setDate(date.getDate() - value * 7);
        break;
      case 'M':
        date.setMonth(date.getMonth() - value);
        break;
      case 'y':
        date.setFullYear(date.getFullYear() - value);
        break;
      default:
        throw new Error('Invalid scope format.');
    }

    return date;
  }

  async isOnCooldown({ cardID, originIP, requesterID }: Partial<CardVisit>) {
    const visitCooldown = this.configService.get('analytics.visitCooldown');
    const cooldownDate = new Date();
    cooldownDate.setHours(cooldownDate.getHours() - visitCooldown);
    // 2024-05-30T09:55:14.555Z

    // Checks if an visit in the cooldown period exist | Return true if exists
    const visit = await this.prismaService.cardVisit.findFirst({
      where: {
        cardID,
        AND: [{ OR: [{ originIP }, { requesterID }] }],
        createdAt: { gte: cooldownDate },
      },
    });

    return !!visit;
  }
}
