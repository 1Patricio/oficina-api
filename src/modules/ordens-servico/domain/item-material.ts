import type { Dinheiro } from '../../../shared/domain/dinheiro'
import { DomainError } from '../../../shared/domain/domain-error'

export class ItemMaterial {
  private constructor(
    readonly materialId: string,
    readonly nome: string,
    readonly precoUnitario: Dinheiro,
    readonly quantidade: number,
  ) {}

  static create(
    materialId: string,
    nome: string,
    precoUnitario: Dinheiro,
    quantidade: number,
  ): ItemMaterial {
    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      throw new DomainError('Quantidade inválida.')
    }
    return new ItemMaterial(materialId, nome, precoUnitario, quantidade)
  }

  get subtotal(): Dinheiro {
    return this.precoUnitario.multiply(this.quantidade)
  }

  somar(quantidade: number): ItemMaterial {
    return ItemMaterial.create(
      this.materialId,
      this.nome,
      this.precoUnitario,
      this.quantidade + quantidade,
    )
  }
}
