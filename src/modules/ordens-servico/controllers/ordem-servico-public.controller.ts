import { Body, Controller, Get, HttpCode, Inject, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { AprovarOrcamentoPublic } from '../use-cases/aprovar-orcamento-public.use-case'
import { ListOrdensServicoPublic } from '../use-cases/list-ordens-servico-public.use-case'
import { RejeitarOrcamentoPublic } from '../use-cases/rejeitar-orcamento-public.use-case'
import { ListOrdensServicoPublicQueryDTO } from './dtos/list-ordens-servico-public-query.dto'
import { ResponderOrcamentoPublicDTO } from './dtos/responder-orcamento-public.dto'

@ApiTags('Ordens de serviço (público)')
@Controller('/public/ordens-servico')
export class OrdemServicoPublicController {
  @Inject()
  private readonly listOrdensServicoPublic: ListOrdensServicoPublic

  @Inject()
  private readonly aprovarOrcamentoPublic: AprovarOrcamentoPublic

  @Inject()
  private readonly rejeitarOrcamentoPublic: RejeitarOrcamentoPublic

  @Get('/')
  list(@Query() query: ListOrdensServicoPublicQueryDTO) {
    return this.listOrdensServicoPublic.execute(query)
  }

  @Post('/:id/aprovar-orcamento')
  @HttpCode(204)
  @ApiOperation({ summary: 'Aprova o orçamento com o documento do cliente e a placa do veículo' })
  aprovar(
    @Param('id', ParseIdPipe) ordemServicoId: string,
    @Body() identificacao: ResponderOrcamentoPublicDTO,
  ) {
    return this.aprovarOrcamentoPublic.execute({ ordemServicoId, ...identificacao })
  }

  @Post('/:id/rejeitar-orcamento')
  @HttpCode(204)
  @ApiOperation({ summary: 'Rejeita o orçamento com o documento do cliente e a placa do veículo' })
  rejeitar(
    @Param('id', ParseIdPipe) ordemServicoId: string,
    @Body() identificacao: ResponderOrcamentoPublicDTO,
  ) {
    return this.rejeitarOrcamentoPublic.execute({ ordemServicoId, ...identificacao })
  }
}
