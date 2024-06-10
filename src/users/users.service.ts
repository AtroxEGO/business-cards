import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../shared/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserData } from './dto/user.interface';
import { StorageService } from '../shared/services/storage.service';
import { randomUUID } from 'crypto';
import { Card } from '@prisma/client';
import { TokenService } from '../shared/services/token.service';
import { Response } from 'express';

export type CreateExternalUserDto = {
  email: string;
  externalId: string;
  cardData: Partial<Card>;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private storageService: StorageService,
    private prismaService: PrismaService,
    private tokenService: TokenService,
  ) {}

  async getUserByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async getUserById(id: string) {
    await this.prismaService.user.findUnique({ where: { id } });
  }

  async createUser(response: Response, payload: CreateUserDto) {
    const { email, password } = payload;

    const userNotUnique = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userNotUnique) {
      const errors = { email: 'Email already in use' };
      throw new BadRequestException({
        message: 'Validation Failed',
        errors,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { uuid, slug } = this.generateUUID();

    const createdUser = await this.prismaService.user.create({
      data: {
        id: uuid,
        email,
        password: hashedPassword,
        card: {
          create: {
            slug: slug,
            socials: {
              create: {
                socialName: 'email',
                value: email,
              },
            },
          },
        },
      },
    });

    this.logger.debug(`Created new user: ${email}`);

    const sessionToken = this.tokenService.getSessionToken(createdUser);

    response.cookie('sessionToken', sessionToken, {
      domain: '.polakiewicz.online',
    });

    return { status: 'success' };
  }

  async createExternalUser(payload: CreateExternalUserDto) {
    const { email, externalId, cardData } = payload;

    console.log(`Email: ${email}`);
    console.log(`External ID: ${externalId}`);
    console.log(`Card Data:`, cardData);

    const { uuid, slug } = this.generateUUID();

    const createdUser = await this.prismaService.user.create({
      data: {
        id: uuid,
        email,
        externalId: externalId,
        card: {
          create: {
            ...cardData,
            slug: slug,
            socials: {
              create: {
                socialName: 'email',
                value: email,
              },
            },
          },
        },
      },
    });

    return createdUser;
  }

  async deleteUser(user: UserData, id: string) {
    if (user.sub !== id) throw new UnauthorizedException();

    try {
      await this.prismaService.user.delete({
        where: { id: id },
      });

      await this.storageService.deleteFile('/avatars', id);
    } catch (error) {
      throw new NotFoundException('User not found');
    }

    return { message: 'success' };
  }

  generateUUID() {
    const uuid = randomUUID() as string;
    const hashedUuid = bcrypt.hashSync(uuid, 1);
    const slug = hashedUuid.slice(8, 16).replace(/[^\w\s-]/g, '');

    return { uuid, slug };
  }
}
