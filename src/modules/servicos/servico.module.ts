import { Module } from '@nestjs/common'
import { EstoqueModule } from '../estoque/estoque.module'
import { ServicoController } from './controllers/servico.controller'
import { ServicoRepository } from './domain/repositories/servico.repository'
import { PrismaServicoRepository } from './infra/repositories/prisma-servico.repository'
import { CreateServico } from './use-cases/create-servico.use-case'

@Module({
  imports: [EstoqueModule],
  controllers: [ServicoController],
  providers: [{ provide: ServicoRepository, useClass: PrismaServicoRepository }, CreateServico],
})
export class ServicoModule {}
