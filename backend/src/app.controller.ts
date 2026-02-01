import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('just-test')
  justTest(@Query('query') query: string): { query: string; timestamp: string } {
    return this.appService.justTest(query);
  }
}
