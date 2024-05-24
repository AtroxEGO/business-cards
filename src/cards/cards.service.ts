import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { PatchCardDto } from './dto/patch-card.dto';
import { UserData } from '../users/dto/user.interface';
import sharp from 'sharp';
import { StorageService } from '../shared/services/storage.service';
import { deleteSocialDto, patchSocialDto } from './dto/card-socials.dto';

@Injectable()
export class CardsService {
  constructor(
    private prismaService: PrismaService,
    private storageService: StorageService,
  ) {}

  async getCard(id: string) {
    const [cardData] = await this.prismaService.card.findMany({
      take: 1,
      where: { OR: [{ id: id }, { slug: id }] },
      include: { socials: { select: { socialName: true, value: true } } },
    });

    if (!cardData) {
      throw new NotFoundException(`Card doesn't exist`);
    }

    return cardData;
  }

  async patchCard(
    body: PatchCardDto,
    file: Express.Multer.File,
    user: UserData,
    cardId: string,
  ) {
    this.hasPermissions(cardId, user.sub);

    const photoUrl = await this.uploadCardPhoto(file, cardId);

    const { socials, ...cardData } = body;

    try {
      const updatedCard = await this.prismaService.card.update({
        where: { id: user.sub },
        data: {
          ...cardData,
          photoUrl,
          socials: socials && {
            deleteMany: {},
            createMany: { data: socials as any },
          },
        },
        include: { socials: { select: { socialName: true, value: true } } },
      });
      return { message: 'success', updatedCard };
    } catch (error) {
      console.log(error);
      throw new Error('Failed to update card.');
    }
  }

  async upsertSocials(body: patchSocialDto, user: UserData, cardId: string) {
    this.hasPermissions(cardId, user.sub);

    const operations = body.socials.map((socialData) =>
      this.prismaService.socialDetail.upsert({
        where: {
          cardId_socialName: {
            cardId: cardId,
            socialName: socialData.socialName,
          },
        },
        create: {
          socialName: socialData.socialName,
          value: socialData.value,
          cardId: cardId,
        },
        update: {
          socialName: socialData.socialName,
          value: socialData.value,
          cardId: cardId,
        },
      }),
    );

    await Promise.all(operations);

    const data = await this.prismaService.card.findUnique({
      where: { id: cardId },
      include: { socials: {} },
    });

    return { message: 'done', data };
  }

  async deleteSocials(body: deleteSocialDto, user: UserData, cardId: string) {
    this.hasPermissions(cardId, user.sub);

    await this.prismaService.socialDetail.delete({
      where: {
        cardId_socialName: {
          cardId: cardId,
          socialName: body.socialName,
        },
      },
    });

    const data = await this.prismaService.card.findUnique({
      where: { id: cardId },
      include: { socials: {} },
    });

    return { message: 'done', data };
  }

  private hasPermissions(cardId: string, sub: string) {
    if (cardId !== sub) throw new UnauthorizedException();
  }

  private async uploadCardPhoto(file: Express.Multer.File, cardId: string) {
    if (!file) return undefined;

    const convertedPhoto = await sharp(file.buffer).resize(512, 512).toBuffer();

    const photoUrl = await this.storageService.uploadFile(
      convertedPhoto,
      '/avatars',
      cardId,
    );

    return photoUrl;
  }
}
