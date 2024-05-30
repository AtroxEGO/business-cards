import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/dto/user.decorator';
import { UserData } from '../users/dto/user.interface';
import { PatchCardDto, patchCardSchema } from './dto/patch-card.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import {
  deleteSocialDto,
  deleteSocialSchema,
  patchSocialDto,
  patchSocialSchema,
} from './dto/card-socials.dto';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CardAnalyticsService } from '../shared/services/cardAnalytics.service';
import { OwnerGuard } from '../shared/guards/owner.guard';

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(
    private cardsService: CardsService,
    private cardAnalyticsService: CardAnalyticsService,
  ) {}

  @ApiCookieAuth('sessionToken')
  @UseGuards(AuthGuard, OwnerGuard)
  @Get(':cardID/analytics')
  getCardAnalytics(
    @Param('cardID') cardID: string,
    @Query('scope') scope: string,
  ) {
    return this.cardAnalyticsService.getCardAnalytics(cardID, scope);
  }

  @Get(':cardID')
  getCard(@Param('cardID') cardID: string) {
    return this.cardsService.getCard(cardID);
  }

  @ApiCookieAuth('sessionToken')
  @UseGuards(AuthGuard)
  @Patch(':cardID')
  @UseInterceptors(FileInterceptor('avatarFile'))
  patchCard(
    @Body(new ValidationPipe(patchCardSchema)) body: PatchCardDto,
    @User() user: UserData,
    @Param('cardID') cardID: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 8000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.cardsService.patchCard(body, file, user, cardID);
  }

  @ApiCookieAuth('sessionToken')
  @UseGuards(AuthGuard)
  @Patch(':cardID/socials')
  upsertCardSocials(
    @Body(new ValidationPipe(patchSocialSchema)) body: patchSocialDto,
    @User() user: UserData,
    @Param('cardID') cardID: string,
  ) {
    return this.cardsService.upsertSocials(body, user, cardID);
  }

  @ApiCookieAuth('sessionToken')
  @UseGuards(AuthGuard)
  @Delete(':cardID/socials')
  deleteCardSocials(
    @Body(new ValidationPipe(deleteSocialSchema)) body: deleteSocialDto,
    @User() user: UserData,
    @Param('cardID') cardID: string,
  ) {
    return this.cardsService.deleteSocials(body, user, cardID);
  }
}
