import { Injectable } from '@nestjs/common'
import { Prisma } from '../../generated/prisma/client'
import { ConflictError } from '../../shared/domain/conflict-error'
import { TransactionManager } from '../../shared/domain/transaction-manager'
import { PrismaService } from './prisma.service'
import { TransactionContext } from './transaction-context'

@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await this.prisma.$transaction((client) => TransactionContext.run(client, callback), {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      })
    } catch (error) {
      if (isWriteConflict(error)) {
        throw new ConflictError('Operação em conflito. Tente novamente.')
      }
      throw error
    }
  }
}

function isWriteConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034'
}
