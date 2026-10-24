import { Module } from '@nestjs/common'
import { EstoqueModule } from '../estoque/estoque.module'
import { ServicoController } from './controllers/servico.controller'
import { ServicoRepository } from './domain/repositories/servico.repository'
import { PrismaServicoRepository } from './infra/repositories/prisma-servico.repository'
import { CreateServico } from './use-cases/create-servico.use-case'
import { GetServico } from './use-cases/get-servico.use-case'
import { ListServicos } from './use-cases/list-servicos.use-case'

@Module({
  imports: [EstoqueModule],
  controllers: [ServicoController],
  providers: [
    { provide: ServicoRepository, useClass: PrismaServicoRepository },
    CreateServico,
    ListServicos,
    GetServico,
  ],
})
export class ServicoModule {}
