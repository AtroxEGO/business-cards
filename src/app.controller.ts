import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Index')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  checkHealth() {
    return this.appService.checkHealth();
  }
}
