import type { Dinheiro } from '../../../shared/domain/dinheiro'
import type { MaterialNecessario } from '../../servicos/domain/material-necessario'

export class ItemServico {
  private constructor(
    readonly servicoId: string,
    readonly nome: string,
    readonly preco: Dinheiro,
    readonly materiais: readonly MaterialNecessario[],
  ) {}

  static create(
    servicoId: string,
    nome: string,
    preco: Dinheiro,
    materiais: readonly MaterialNecessario[] = [],
  ): ItemServico {
    return new ItemServico(servicoId, nome, preco, materiais)
  }
}
