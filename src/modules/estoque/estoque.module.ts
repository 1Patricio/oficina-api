import { Module } from '@nestjs/common'
import { MateriaisController } from './controllers/materiais.controller'
import { MaterialRepository } from './domain/repositories/material.repository'
import { PrismaMaterialRepository } from './infra/repositories/prisma-material.repository'
import { CreateMaterial } from './use-cases/create-material.use-case'

@Module({
  controllers: [MateriaisController],
  providers: [{ provide: MaterialRepository, useClass: PrismaMaterialRepository }, CreateMaterial],
})
export class EstoqueModule {}
