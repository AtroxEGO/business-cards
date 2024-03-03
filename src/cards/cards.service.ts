import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../shared/services/prisma.service';
import { PatchCardDto } from './dto/patch-card.dto';
import { UserData } from 'src/users/dto/user.interface';

@Injectable()
export class CardsService {
  constructor(private prismaService: PrismaService) {}

  async getCard(id: string) {
    const cardData = await this.prismaService.card.findUnique({
      where: { id: id },
      include: { socials: { select: { socialName: true, value: true } } },
    });

    if (!cardData) {
      throw new NotFoundException(`Card doesn't exist`);
    }

    return cardData;
  }

  async patchCard(body: PatchCardDto, user: UserData, cardId: string) {
    this.checkIfOwner(cardId, user.sub);

    // TODO: socials patching

    try {
      await this.prismaService.card.update({
        where: { id: user.sub },
        data: { ...body },
      });
      return { message: 'success' };
    } catch (error) {
      throw new Error('Failed to update card.');
    }
  }

  private checkIfOwner(accessedId: string, userId: string) {
    const isOwner = accessedId === userId;

    if (!isOwner) throw new UnauthorizedException();
  }
}
