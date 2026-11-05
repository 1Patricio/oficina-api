import { AsyncLocalStorage } from 'node:async_hooks'
import type { Prisma } from '../../generated/prisma/client'

export class TransactionContext {
  private static readonly storage = new AsyncLocalStorage<Prisma.TransactionClient>()

  static getClient(): Prisma.TransactionClient | undefined {
    return TransactionContext.storage.getStore()
  }

  static run<T>(client: Prisma.TransactionClient, fn: () => Promise<T>): Promise<T> {
    return TransactionContext.storage.run(client, fn)
  }
}
