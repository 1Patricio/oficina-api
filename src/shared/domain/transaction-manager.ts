export abstract class TransactionManager {
  abstract runInTransaction<T>(callback: () => Promise<T>): Promise<T>
}
