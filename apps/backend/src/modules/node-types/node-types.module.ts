import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeType } from './entities/node-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NodeType])],
})
export class NodeTypesModule {}
