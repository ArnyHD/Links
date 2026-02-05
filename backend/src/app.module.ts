import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DomainsModule } from './domains/domains.module';
import { NodeTypesModule } from './node-types/node-types.module';
import { EdgeTypesModule } from './edge-types/edge-types.module';
import { EdgesModule } from './edges/edges.module';
import { NodesModule } from './nodes/nodes.module';
import { User, OAuthAccount, Domain, NodeType, EdgeType, Node, Edge } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'knowledge_graph',
      entities: [User, OAuthAccount, Domain, NodeType, EdgeType, Node, Edge],
      synchronize: false, // Используем миграции вместо автосинхронизации
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    DomainsModule,
    NodeTypesModule,
    EdgeTypesModule,
    NodesModule,
    EdgesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
