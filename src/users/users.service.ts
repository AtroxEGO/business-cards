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
import { JwtService } from '@nestjs/jwt';
import { UserData } from './dto/user.interface';
import { StorageService } from '../shared/services/storage.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private storageService: StorageService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(payload: CreateUserDto) {
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

    const createdUser = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        card: {
          create: {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, id, ...tokenPayload } = createdUser;

    const accessToken = await this.jwtService.signAsync({
      sub: id,
      ...tokenPayload,
    });

    return { accessToken };
  }

  async deleteUser(user: UserData, id: string) {
    if (user.sub !== id) throw new UnauthorizedException();

    try {
      await this.storageService.deleteFile('/avatars', id);

      await this.prismaService.user.delete({
        where: { id: id },
      });
    } catch (error) {
      throw new NotFoundException('User not found');
    }

    return { message: 'success' };
  }
}
