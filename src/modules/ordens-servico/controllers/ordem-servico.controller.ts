import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { AprovarOrcamento } from '../use-cases/aprovar-orcamento.use-case'
import { CreateOrdemServico } from '../use-cases/create-ordem-servico.use-case'
import { EntregarOrdemServico } from '../use-cases/entregar-ordem-servico.use-case'
import { EnviarOrcamento } from '../use-cases/enviar-orcamento.use-case'
import { FinalizarOrdemServico } from '../use-cases/finalizar-ordem-servico.use-case'
import { GetOrdemServico } from '../use-cases/get-ordem-servico.use-case'
import { IncluirItens } from '../use-cases/incluir-itens.use-case'
import { IniciarDiagnostico } from '../use-cases/iniciar-diagnostico.use-case'
import { ListOrdemServico } from '../use-cases/list-ordem-servico.use-case'
import { RejeitarOrcamento } from '../use-cases/rejeitar-orcamento.use-case'
import { CreateOrdemServicoDTO } from './dtos/create-ordem-servico.dto'
import { IncluirItensDTO } from './dtos/incluir-itens.dto'
import { ListOrdensServicoQueryDTO } from './dtos/list-ordens-servico-query.dto'

@Controller('/ordens-servico')
export class OrdemServicoController {
  @Inject(CreateOrdemServico)
  private readonly createOrdemServico: CreateOrdemServico

  @Inject()
  private readonly listOrdemServico: ListOrdemServico

  @Inject()
  private readonly getOrdemServico: GetOrdemServico

  @Inject()
  private readonly incluirItens: IncluirItens

  @Inject()
  private readonly iniciarDiagnostico: IniciarDiagnostico

  @Inject()
  private readonly enviarOrcamento: EnviarOrcamento

  @Inject()
  private readonly aprovarOrcamento: AprovarOrcamento

  @Inject()
  private readonly rejeitarOrcamento: RejeitarOrcamento

  @Inject()
  private readonly finalizarOrdemServico: FinalizarOrdemServico

  @Inject()
  private readonly entregarOrdemServico: EntregarOrdemServico

  @Post('/')
  create(@Body() ordemServico: CreateOrdemServicoDTO) {
    return this.createOrdemServico.execute(ordemServico)
  }

  @Get('/')
  list(@Query() query: ListOrdensServicoQueryDTO) {
    return this.listOrdemServico.execute(query)
  }

  @Get('/:id')
  get(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.getOrdemServico.execute({ ordemServicoId })
  }

  @Post('/:id/itens')
  @HttpCode(204)
  incluir(@Param('id', ParseIdPipe) ordemServicoId: string, @Body() itens: IncluirItensDTO) {
    return this.incluirItens.execute({ ordemServicoId, ...itens })
  }

  @Post('/:id/iniciar-diagnostico')
  @HttpCode(204)
  iniciar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.iniciarDiagnostico.execute({ ordemServicoId })
  }

  @Post('/:id/enviar-orcamento')
  @HttpCode(204)
  enviar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.enviarOrcamento.execute({ ordemServicoId })
  }

  @Post('/:id/aprovar-orcamento')
  @HttpCode(204)
  aprovar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.aprovarOrcamento.execute({ ordemServicoId })
  }

  @Post('/:id/rejeitar-orcamento')
  @HttpCode(204)
  rejeitar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.rejeitarOrcamento.execute({ ordemServicoId })
  }

  @Post('/:id/finalizar')
  @HttpCode(204)
  finalizar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.finalizarOrdemServico.execute({ ordemServicoId })
  }

  @Post('/:id/entregar')
  @HttpCode(204)
  entregar(@Param('id', ParseIdPipe) ordemServicoId: string) {
    return this.entregarOrdemServico.execute({ ordemServicoId })
  }
}
