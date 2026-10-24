import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateServico } from '../use-cases/create-servico.use-case'
import { GetServico } from '../use-cases/get-servico.use-case'
import { ListServicos } from '../use-cases/list-servicos.use-case'
import { CreateServicoDTO } from './dtos/create-servico.dto'
import { ListServicosQueryDTO } from './dtos/list-servicos-query.dto'

@Controller('/servicos')
export class ServicoController {
  @Inject(CreateServico)
  private readonly createServico: CreateServico

  @Inject(ListServicos)
  private readonly listServicos: ListServicos

  @Inject(GetServico)
  private readonly getServico: GetServico

  @Post('/')
  create(@Body() servico: CreateServicoDTO) {
    return this.createServico.execute(servico)
  }

  @Get('/')
  list(@Query() query: ListServicosQueryDTO) {
    return this.listServicos.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }

  @Get('/:id')
  get(@Param('id', ParseIdPipe) servicoId: string) {
    return this.getServico.execute({ servicoId })
  }
}
