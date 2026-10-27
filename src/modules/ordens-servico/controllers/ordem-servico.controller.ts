import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateOrdemServico } from '../use-cases/create-ordem-servico.use-case'
import { GetOrdemServico } from '../use-cases/get-ordem-servico.use-case'
import { ListOrdemServico } from '../use-cases/list-ordem-servico.use-case'
import { CreateOrdemServicoDTO } from './dtos/create-ordem-servico.dto'
import { ListOrdensServicoQueryDTO } from './dtos/list-ordens-servico-query.dto'

@Controller('/ordens-servico')
export class OrdemServicoController {
  @Inject(CreateOrdemServico)
  private readonly createOrdemServico: CreateOrdemServico

  @Inject()
  private readonly listOrdemServico: ListOrdemServico

  @Inject()
  private readonly getOrdemServico: GetOrdemServico

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
}
