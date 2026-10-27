import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateOrdemServico } from '../use-cases/create-ordem-servico.use-case'
import { CreateOrdemServicoDTO } from './dtos/create-ordem-servico.dto'

@Controller('/ordens-servico')
export class OrdemServicoController {
  @Inject(CreateOrdemServico)
  private readonly createOrdemServico: CreateOrdemServico

  @Post('/')
  create(@Body() ordemServico: CreateOrdemServicoDTO) {
    return this.createOrdemServico.execute(ordemServico)
  }
}
