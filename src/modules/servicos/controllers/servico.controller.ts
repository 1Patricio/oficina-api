import { Body, Controller, Get, HttpCode, Inject, Param, Post, Put, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateServico } from '../use-cases/create-servico.use-case'
import { GetServico } from '../use-cases/get-servico.use-case'
import { ListServicos } from '../use-cases/list-servicos.use-case'
import { UpdateServico } from '../use-cases/update-servico.use-case'
import { CreateServicoDTO } from './dtos/create-servico.dto'
import { ListServicosQueryDTO } from './dtos/list-servicos-query.dto'
import { UpdateServicoDTO } from './dtos/update-servico.dto'

@Controller('/servicos')
export class ServicoController {
  @Inject(CreateServico)
  private readonly createServico: CreateServico

  @Inject(ListServicos)
  private readonly listServicos: ListServicos

  @Inject(GetServico)
  private readonly getServico: GetServico

  @Inject(UpdateServico)
  private readonly updateServico: UpdateServico

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

  @Put('/:id')
  @HttpCode(204)
  update(@Param('id', ParseIdPipe) servicoId: string, @Body() servico: UpdateServicoDTO) {
    return this.updateServico.execute({ servicoId, ...servico })
  }
}
