import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { ValidationPipe } from '../shared/pipes/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
}
