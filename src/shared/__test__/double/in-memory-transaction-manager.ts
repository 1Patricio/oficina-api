import { TransactionManager } from '../../domain/transaction-manager'

export class InMemoryTransactionManager extends TransactionManager {
  runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    return callback()
  }
}
