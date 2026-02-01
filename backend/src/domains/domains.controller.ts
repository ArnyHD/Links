import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainsService } from './domains.service';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  /**
   * GET /domains
   * Получить все домены
   * Требует JWT аутентификацию, но доступен всем авторизованным пользователям
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllDomains() {
    const domains = await this.domainsService.findAll();
    return {
      success: true,
      count: domains.length,
      data: domains,
    };
  }
}
