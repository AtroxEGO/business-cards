import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { CardAnalyticsMiddleware } from '../shared/middleware/cardAnalytics.middleware';
import { CardAnalyticsService } from '../shared/services/cardAnalytics.service';

@Module({
  controllers: [CardsController],
  providers: [CardsService, CardAnalyticsService],
})
export class CardsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CardAnalyticsMiddleware)
      .exclude({ path: 'cards/:cardID/analytics', method: RequestMethod.GET })
      .forRoutes({ path: 'cards/:cardID', method: RequestMethod.GET });
  }
}
