import { Module } from '@nestjs/common'
import { ClienteModule } from '../clientes/cliente.module'
import { EstoqueModule } from '../estoque/estoque.module'
import { ServicoModule } from '../servicos/servico.module'
import { VeiculoModule } from '../veiculos/veiculo.module'
import { OrdemServicoController } from './controllers/ordem-servico.controller'
import { OrdemServicoRepository } from './domain/repositories/ordem-servico.repository'
import { PrismaOrdemServicoRepository } from './infra/repositories/prisma-ordem-servico.repository'
import { CreateOrdemServico } from './use-cases/create-ordem-servico.use-case'

@Module({
  imports: [ClienteModule, VeiculoModule, ServicoModule, EstoqueModule],
  controllers: [OrdemServicoController],
  providers: [
    { provide: OrdemServicoRepository, useClass: PrismaOrdemServicoRepository },
    CreateOrdemServico,
  ],
  exports: [OrdemServicoRepository],
})
export class OrdemServicoModule {}
