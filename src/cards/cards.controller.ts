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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Cards')
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get(':id')
  getCard(@Param('id') id: string) {
    return this.cardsService.getCard(id);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatarFile'))
  patchCard(
    @Body(new ValidationPipe(patchCardSchema)) body: PatchCardDto,
    @User() user: UserData,
    @Param('id') cardId: string,
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
    return this.cardsService.patchCard(body, file, user, cardId);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @Patch(':id/socials')
  upsertCardSocials(
    @Body(new ValidationPipe(patchSocialSchema)) body: patchSocialDto,
    @User() user: UserData,
    @Param('id') cardId: string,
  ) {
    return this.cardsService.upsertSocials(body, user, cardId);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(AuthGuard)
  @Delete(':id/socials')
  deleteCardSocials(
    @Body(new ValidationPipe(deleteSocialSchema)) body: deleteSocialDto,
    @User() user: UserData,
    @Param('id') cardId: string,
  ) {
    return this.cardsService.deleteSocials(body, user, cardId);
  }
}
