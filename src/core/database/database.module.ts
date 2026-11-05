import { Global, Module } from '@nestjs/common'
import { TransactionManager } from '../../shared/domain/transaction-manager'
import { PrismaService } from './prisma.service'
import { PrismaTransactionManager } from './prisma-transaction-manager'

@Global()
@Module({
  providers: [PrismaService, { provide: TransactionManager, useClass: PrismaTransactionManager }],
  exports: [PrismaService, TransactionManager],
})
export class DatabaseModule {}
