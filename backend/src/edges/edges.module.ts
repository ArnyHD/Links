import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgesController } from './edges.controller';
import { EdgesService } from './edges.service';
import { Edge, Node, EdgeType } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Edge, Node, EdgeType])],
  controllers: [EdgesController],
  providers: [EdgesService],
  exports: [EdgesService],
})
export class EdgesModule {}
