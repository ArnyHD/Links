import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@ApiTags('domains')
@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new domain' })
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
  // @ApiBearerAuth()
  create(
    @Body() createDomainDto: CreateDomainDto,
    // @CurrentUser() user: User, // Uncomment when auth is ready
  ) {
    const userId = 'temp-user-id'; // Replace with real user ID
    return this.domainsService.create(createDomainDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all domains' })
  findAll(@Query('public') isPublic?: boolean) {
    return this.domainsService.findAll(isPublic);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get domain by ID' })
  findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get domain by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.domainsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update domain' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    return this.domainsService.update(id, updateDomainDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete domain' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.domainsService.remove(id);
  }
}
