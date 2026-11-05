import type { ConfigService } from '@nestjs/config'
import type { Prisma } from '../../generated/prisma/client'
import { PrismaService } from '../database/prisma.service'
import { TransactionContext } from '../database/transaction-context'

const config = { getOrThrow: () => 'postgresql://oficina@localhost/oficina' }

describe('PrismaService', () => {
  const prisma = new PrismaService(config as unknown as ConfigService)

  it('devolve o client com os modelos fora de transação', () => {
    expect(prisma.getClient().material).toBeDefined()
  })

  it('devolve o client da transação ativa', async () => {
    const client = {} as Prisma.TransactionClient

    const clientAtivo = await TransactionContext.run(client, () =>
      Promise.resolve(prisma.getClient()),
    )

    expect(clientAtivo).toBe(client)
  })
})
