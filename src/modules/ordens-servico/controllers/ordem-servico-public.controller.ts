import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ListOrdensServicoPublic } from '../use-cases/list-ordens-servico-public.use-case'
import { ListOrdensServicoPublicQueryDTO } from './dtos/list-ordens-servico-public-query.dto'

@Controller('/public/ordens-servico')
export class OrdemServicoPublicController {
  @Inject()
  private readonly listOrdensServicoPublic: ListOrdensServicoPublic

  @Get('/')
  list(@Query() query: ListOrdensServicoPublicQueryDTO) {
    return this.listOrdensServicoPublic.execute(query)
  }
}
