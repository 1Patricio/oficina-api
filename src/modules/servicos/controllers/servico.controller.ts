import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { CreateServico } from '../use-cases/create-servico.use-case'
import { ListServicos } from '../use-cases/list-servicos.use-case'
import { CreateServicoDTO } from './dtos/create-servico.dto'
import { ListServicosQueryDTO } from './dtos/list-servicos-query.dto'

@Controller('/servicos')
export class ServicoController {
  @Inject(CreateServico)
  private readonly createServico: CreateServico

  @Inject(ListServicos)
  private readonly listServicos: ListServicos

  @Post('/')
  create(@Body() servico: CreateServicoDTO) {
    return this.createServico.execute(servico)
  }

  @Get('/')
  list(@Query() query: ListServicosQueryDTO) {
    return this.listServicos.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }
}
