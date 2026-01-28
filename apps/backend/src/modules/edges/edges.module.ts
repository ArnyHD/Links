import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edge } from './entities/edge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Edge])],
})
export class EdgesModule {}
