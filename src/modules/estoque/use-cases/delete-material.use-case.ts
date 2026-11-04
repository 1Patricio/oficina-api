import { Injectable } from '@nestjs/common'
import { ConflictError } from '../../../shared/domain/conflict-error'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { MaterialRepository } from '../domain/repositories/material.repository'

type Request = {
  materialId: string
}

@Injectable()
export class DeleteMaterial {
  constructor(private readonly materialRepository: MaterialRepository) {}

  async execute({ materialId }: Request): Promise<void> {
    const material = await this.materialRepository.findById(materialId)

    if (!material) throw new NotFoundError('Material não encontrado.')

    if (await this.materialRepository.isUsedInServico(materialId)) {
      throw new ConflictError('Material vinculado a serviços.')
    }

    material.delete()
    await this.materialRepository.save(material)
  }
}
