import { Module } from '@nestjs/common'
import { MaterialController } from './controllers/material.controller'
import { MaterialRepository } from './domain/repositories/material.repository'
import { PrismaMaterialRepository } from './infra/repositories/prisma-material.repository'
import { CreateMaterial } from './use-cases/create-material.use-case'

@Module({
  controllers: [MaterialController],
  providers: [{ provide: MaterialRepository, useClass: PrismaMaterialRepository }, CreateMaterial],
})
export class EstoqueModule {}
