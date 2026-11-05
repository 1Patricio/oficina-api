import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { type Prisma, PrismaClient } from '../../generated/prisma/client'
import { TransactionContext } from './transaction-context'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
      }),
    })
  }

  getClient(): Prisma.TransactionClient {
    return TransactionContext.getClient() ?? this
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
