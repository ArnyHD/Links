import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  justTest(query: string): { query: string; timestamp: string } {
    return {
      query: query || 'no query provided',
      timestamp: new Date().toISOString(),
    };
  }
}
