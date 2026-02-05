import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { Node, Domain, NodeType, User } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Node, Domain, NodeType, User])],
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService],
})
export class NodesModule {}
