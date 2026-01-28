import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DomainsModule } from './modules/domains/domains.module';
import { NodeTypesModule } from './modules/node-types/node-types.module';
import { NodesModule } from './modules/nodes/nodes.module';
import { EdgeTypesModule } from './modules/edge-types/edge-types.module';
import { EdgesModule } from './modules/edges/edges.module';
import { RatingsModule } from './modules/ratings/ratings.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development', // Only for dev
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    DomainsModule,
    NodeTypesModule,
    NodesModule,
    EdgeTypesModule,
    EdgesModule,
    RatingsModule,
  ],
})
export class AppModule {}
