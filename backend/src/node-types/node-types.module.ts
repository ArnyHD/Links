import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeTypesController } from './node-types.controller';
import { NodeTypesService } from './node-types.service';
import { NodeType, Domain } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([NodeType, Domain])],
  controllers: [NodeTypesController],
  providers: [NodeTypesService],
  exports: [NodeTypesService],
})
export class NodeTypesModule {}
