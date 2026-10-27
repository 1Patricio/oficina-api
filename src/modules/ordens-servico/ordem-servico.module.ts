import { Module } from '@nestjs/common'
import { OrdemServicoRepository } from './domain/repositories/ordem-servico.repository'
import { PrismaOrdemServicoRepository } from './infra/repositories/prisma-ordem-servico.repository'

@Module({
  providers: [{ provide: OrdemServicoRepository, useClass: PrismaOrdemServicoRepository }],
  exports: [OrdemServicoRepository],
})
export class OrdemServicoModule {}
