import { Controller, Get } from '@nestjs/common';
import { AppService } from '../Service/app.service';

@Controller()
export class UsersController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
