import { Prisma } from '../../generated/prisma/client'
import { ConflictError } from '../../shared/domain/conflict-error'
import type { PrismaService } from '../database/prisma.service'
import { PrismaTransactionManager } from '../database/prisma-transaction-manager'
import { TransactionContext } from '../database/transaction-context'

const client = {} as Prisma.TransactionClient

function createManager($transaction: unknown) {
  return new PrismaTransactionManager({ $transaction } as unknown as PrismaService)
}

describe('PrismaTransactionManager', () => {
  it('executa o callback com o client da transação em isolamento serializável', async () => {
    const $transaction = vi.fn((callback: (client: Prisma.TransactionClient) => Promise<unknown>) =>
      callback(client),
    )
    const manager = createManager($transaction)

    const clientNoCallback = await manager.runInTransaction(() =>
      Promise.resolve(TransactionContext.getClient()),
    )

    expect(clientNoCallback).toBe(client)
    expect(TransactionContext.getClient()).toBeUndefined()
    expect($transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    })
  })

  it('converte conflito de escrita em ConflictError', async () => {
    const conflito = new Prisma.PrismaClientKnownRequestError('Conflito', {
      code: 'P2034',
      clientVersion: '7.10.0',
    })
    const manager = createManager(() => Promise.reject(conflito))

    await expect(manager.runInTransaction(() => Promise.resolve())).rejects.toThrow(ConflictError)
  })

  it('repassa os demais erros', async () => {
    const erro = new Error('Falha no banco')
    const manager = createManager(() => Promise.reject(erro))

    await expect(manager.runInTransaction(() => Promise.resolve())).rejects.toBe(erro)
  })
})
