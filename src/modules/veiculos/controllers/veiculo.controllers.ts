import { Body, Controller, Inject, Post } from '@nestjs/common'
import { CreateVeiculo } from '../use-cases/create-veiculo.use-case'
import { CreateVeiculoDTO } from './dtos/create-veiculo.dto'

@Controller('/veiculos')
export class VeiculoController {
  @Inject(CreateVeiculo)
  private readonly createVeiculo: CreateVeiculo

  @Post('/')
  create(@Body() veiculo: CreateVeiculoDTO) {
    return this.createVeiculo.execute(veiculo)
  }
}
