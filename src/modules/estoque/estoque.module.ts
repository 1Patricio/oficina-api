import { Module } from '@nestjs/common'
import { MaterialController } from './controllers/material.controller'
import { MaterialRepository } from './domain/repositories/material.repository'
import { PrismaMaterialRepository } from './infra/repositories/prisma-material.repository'
import { CreateMaterial } from './use-cases/create-material.use-case'
import { ListMateriais } from './use-cases/list-materiais.use-case'

@Module({
  controllers: [MaterialController],
  providers: [
    { provide: MaterialRepository, useClass: PrismaMaterialRepository },
    CreateMaterial,
    ListMateriais,
  ],
  exports: [MaterialRepository],
})
export class EstoqueModule {}
