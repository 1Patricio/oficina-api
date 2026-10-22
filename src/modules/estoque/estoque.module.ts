import { Module } from '@nestjs/common'
import { MateriaisController } from './controllers/materiais.controller'
import { MaterialRepository } from './domain/repositories/material.repository'
import { PrismaMaterialRepository } from './infra/repositories/prisma-material.repository'

@Module({
  controllers: [MateriaisController],
  providers: [
    { provide: MaterialRepository, useClass: PrismaMaterialRepository },
  ],
})
export class EstoqueModule {}
