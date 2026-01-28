import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeType } from './entities/edge-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EdgeType])],
})
export class EdgeTypesModule {}
