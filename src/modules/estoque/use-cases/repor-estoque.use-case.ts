import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { TransactionManager } from '../../../shared/domain/transaction-manager'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  materialId: string
  quantidade: number
}

@Injectable()
export class ReporEstoque {
  constructor(
    private readonly materialRepository: MaterialRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute({ materialId, quantidade }: Request): Promise<void> {
    await this.transactionManager.runInTransaction(async () => {
      const material = await this.materialRepository.findById(materialId)
      if (!material) throw new NotFoundError('Material não encontrado.')

      material.addEstoque(quantidade)
      await this.materialRepository.save(material)
    })
  }
}
