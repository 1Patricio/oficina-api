import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateServico } from '../use-cases/create-servico.use-case'
import { CreateServicoDTO } from './dtos/create-servico.dto'

@Controller('/servicos')
export class ServicoController {
  @Inject(CreateServico)
  private readonly createServico: CreateServico

  @Post('/')
  create(@Body() servico: CreateServicoDTO) {
    return this.createServico.execute(servico)
  }
}
