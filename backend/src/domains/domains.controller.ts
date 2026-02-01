import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Controller('domains')
@UseGuards(AuthGuard('jwt'))
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  /**
   * GET /domains
   * Получить все домены
   */
  @Get()
  async getAllDomains() {
    const domains = await this.domainsService.findAll();
    return {
      success: true,
      count: domains.length,
      data: domains,
    };
  }

  /**
   * GET /domains/:id
   * Получить один домен по ID
   */
  @Get(':id')
  async getDomain(@Param('id') id: string) {
    const domain = await this.domainsService.findOne(id);
    return {
      success: true,
      data: domain,
    };
  }

  /**
   * POST /domains
   * Создать новый домен
   */
  @Post()
  async createDomain(@Body() createDomainDto: CreateDomainDto, @Req() req: any) {
    const domain = await this.domainsService.create(
      createDomainDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Domain created successfully',
      data: domain,
    };
  }

  /**
   * PUT /domains/:id
   * Обновить домен
   */
  @Put(':id')
  async updateDomain(
    @Param('id') id: string,
    @Body() updateDomainDto: UpdateDomainDto,
    @Req() req: any,
  ) {
    const domain = await this.domainsService.update(
      id,
      updateDomainDto,
      req.user.id,
    );
    return {
      success: true,
      message: 'Domain updated successfully',
      data: domain,
    };
  }

  /**
   * DELETE /domains/:id
   * Удалить домен
   */
  @Delete(':id')
  async deleteDomain(@Param('id') id: string, @Req() req: any) {
    await this.domainsService.remove(id, req.user.id);
    return {
      success: true,
      message: 'Domain deleted successfully',
    };
  }
}
