import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // This automatically connects to your SQLite database when NestJS starts

  async onModuleInit() {
    await this.$connect();
  }
}
