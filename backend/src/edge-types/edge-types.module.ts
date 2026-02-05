import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeTypesController } from './edge-types.controller';
import { EdgeTypesService } from './edge-types.service';
import { EdgeType, Domain } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([EdgeType, Domain])],
  controllers: [EdgeTypesController],
  providers: [EdgeTypesService],
  exports: [EdgeTypesService],
})
export class EdgeTypesModule {}
