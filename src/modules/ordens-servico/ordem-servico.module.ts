import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport } from 'nodemailer'
import { ClienteModule } from '../clientes/cliente.module'
import { EstoqueModule } from '../estoque/estoque.module'
import { ServicoModule } from '../servicos/servico.module'
import { VeiculoModule } from '../veiculos/veiculo.module'
import { OrdemServicoController } from './controllers/ordem-servico.controller'
import { OrdemServicoPublicController } from './controllers/ordem-servico-public.controller'
import { NotificadorOrcamento } from './domain/notificadores/notificador-orcamento'
import { OrdemServicoRepository } from './domain/repositories/ordem-servico.repository'
import { SmtpNotificadorOrcamento } from './infra/notificadores/smtp-notificador-orcamento'
import { PrismaOrdemServicoRepository } from './infra/repositories/prisma-ordem-servico.repository'
import { AprovarOrcamento } from './use-cases/aprovar-orcamento.use-case'
import { CreateOrdemServico } from './use-cases/create-ordem-servico.use-case'
import { EntregarOrdemServico } from './use-cases/entregar-ordem-servico.use-case'
import { EnviarOrcamento } from './use-cases/enviar-orcamento.use-case'
import { FinalizarOrdemServico } from './use-cases/finalizar-ordem-servico.use-case'
import { GetOrdemServico } from './use-cases/get-ordem-servico.use-case'
import { GetTempoMedio } from './use-cases/get-tempo-medio.use-case'
import { IncluirItens } from './use-cases/incluir-itens.use-case'
import { IniciarDiagnostico } from './use-cases/iniciar-diagnostico.use-case'
import { ListOrdemServico } from './use-cases/list-ordem-servico.use-case'
import { ListOrdensServicoPublic } from './use-cases/list-ordens-servico-public.use-case'
import { RejeitarOrcamento } from './use-cases/rejeitar-orcamento.use-case'

@Module({
  imports: [ClienteModule, VeiculoModule, ServicoModule, EstoqueModule],
  controllers: [OrdemServicoController, OrdemServicoPublicController],
  providers: [
    { provide: OrdemServicoRepository, useClass: PrismaOrdemServicoRepository },
    {
      provide: NotificadorOrcamento,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new SmtpNotificadorOrcamento(
          createTransport({
            host: config.get<string>('SMTP_HOST', 'localhost'),
            port: Number(config.get('SMTP_PORT', 1025)),
          }),
          config.get<string>('SMTP_FROM', 'oficina@oficina.local'),
        ),
    },
    CreateOrdemServico,
    ListOrdemServico,
    ListOrdensServicoPublic,
    GetOrdemServico,
    GetTempoMedio,
    IncluirItens,
    IniciarDiagnostico,
    EnviarOrcamento,
    AprovarOrcamento,
    RejeitarOrcamento,
    FinalizarOrdemServico,
    EntregarOrdemServico,
  ],
  exports: [OrdemServicoRepository],
})
export class OrdemServicoModule {}
