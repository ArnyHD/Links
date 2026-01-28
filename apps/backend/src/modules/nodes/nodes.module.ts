import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './entities/node.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Node])],
})
export class NodesModule {}
