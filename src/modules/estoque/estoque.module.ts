import { Module } from '@nestjs/common'
import { MaterialController } from './controllers/material.controller'
import { MaterialRepository } from './domain/repositories/material.repository'
import { PrismaMaterialRepository } from './infra/repositories/prisma-material.repository'
import { CreateMaterial } from './use-cases/create-material.use-case'
import { DeleteMaterial } from './use-cases/delete-material.use-case'
import { GetMaterial } from './use-cases/get-material.use-case'
import { ListMateriais } from './use-cases/list-materiais.use-case'
import { ReporEstoque } from './use-cases/repor-estoque.use-case'
import { UpdateMaterial } from './use-cases/update-material.use-case'

@Module({
  controllers: [MaterialController],
  providers: [
    { provide: MaterialRepository, useClass: PrismaMaterialRepository },
    CreateMaterial,
    ListMateriais,
    GetMaterial,
    UpdateMaterial,
    DeleteMaterial,
    ReporEstoque,
  ],
  exports: [MaterialRepository],
})
export class EstoqueModule {}
