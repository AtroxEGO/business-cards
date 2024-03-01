import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../shared/services/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(payload: CreateUserDto) {
    this.logger.log('Processing new User');

    const { fullName, email, password } = payload;

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
        fullName,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...tokenPayload } = createdUser;

    return { accessToken: await this.jwtService.signAsync(tokenPayload) };
  }
}
