import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { CardsService } from './cards.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/dto/user.decorator';
import { UserData } from '../users/dto/user.interface';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { PatchCardDto, patchCardSchema } from './dto/patch-card.dto';

@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Get(':id')
  getCard(@Param('id') id: string) {
    return this.cardsService.getCard(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  patchCard(
    @Body(new ValidationPipe(patchCardSchema)) body: PatchCardDto,
    @User() user: UserData,
    @Param('id') cardId: string,
  ) {
    return this.cardsService.patchCard(body, user, cardId);
  }

  // TODO: Implement uploadin pictures
  // @Post(':cardId/picture')
  // @UseInterceptors(FileInterceptor('picture'))
  // async uploadCardPicture(
  //   @Param('cardId') cardId: string,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return this.cardsService.uploadCardPicture(file, cardId);
  // }
}
