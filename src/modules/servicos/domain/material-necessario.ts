import { DomainError } from '../../../shared/domain/domain-error'

export class MaterialNecessario {
  private constructor(
    readonly materialId: string,
    readonly quantidade: number,
  ) {}

  static create(materialId: string, quantidade: number): MaterialNecessario {
    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      throw new DomainError('Quantidade inválida.')
    }
    return new MaterialNecessario(materialId, quantidade)
  }
}
