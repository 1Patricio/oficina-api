import { Injectable } from '@nestjs/common'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { TransactionManager } from '../../../shared/domain/transaction-manager'
import { MaterialRepository } from '../../estoque/domain/repositories/material.repository'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Request = {
  ordemServicoId: string
}

@Injectable()
export class AprovarOrcamento {
  constructor(
    private readonly ordemServicoRepository: OrdemServicoRepository,
    private readonly materialRepository: MaterialRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute({ ordemServicoId }: Request): Promise<void> {
    await this.transactionManager.runInTransaction(async () => {
      const ordem = await this.ordemServicoRepository.findById(ordemServicoId)
      if (!ordem) throw new NotFoundError('Ordem de serviço não encontrada.')

      ordem.aprovarOrcamento()

      const materiaisNecessarios = ordem.materiaisNecessarios
      const materiais = await this.materialRepository.findManyByIds(
        materiaisNecessarios.map((material) => material.materialId),
      )

      for (const necessario of materiaisNecessarios) {
        const material = materiais.find((item) => item.id === necessario.materialId)
        if (!material) throw new NotFoundError('Material não encontrado.')

        material.removeEstoque(necessario.quantidade)
        await this.materialRepository.save(material)
      }

      await this.ordemServicoRepository.save(ordem)
    })
  }
}
