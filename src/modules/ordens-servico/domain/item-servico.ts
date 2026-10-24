import type { Dinheiro } from '../../../shared/domain/dinheiro'

export class ItemServico {
  private constructor(
    readonly servicoId: string,
    readonly nome: string,
    readonly preco: Dinheiro,
  ) {}

  static create(servicoId: string, nome: string, preco: Dinheiro): ItemServico {
    return new ItemServico(servicoId, nome, preco)
  }
}
