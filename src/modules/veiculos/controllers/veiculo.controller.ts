import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateVeiculo } from '../use-cases/create-veiculo.use-case'
import { GetVeiculo } from '../use-cases/get-veiculo.use-case'
import { ListVeiculos } from '../use-cases/list-veiculos.use-case'
import { CreateVeiculoDTO } from './dtos/create-veiculo.dto'
import { ListVeiculosQueryDTO } from './dtos/list-veiculos-query.dto'

@Controller('/veiculos')
export class VeiculoController {
  @Inject(CreateVeiculo)
  private readonly createVeiculo: CreateVeiculo

  @Inject(ListVeiculos)
  private readonly listVeiculos: ListVeiculos

  @Inject(GetVeiculo)
  private readonly getVeiculo: GetVeiculo

  @Post('/')
  create(@Body() veiculo: CreateVeiculoDTO) {
    return this.createVeiculo.execute(veiculo)
  }

  @Get('/')
  list(@Query() query: ListVeiculosQueryDTO) {
    return this.listVeiculos.execute({ page: query.page, rpp: query.rpp, term: query.busca })
  }

  @Get('/:id')
  get(@Param('id', ParseIdPipe) veiculoId: string) {
    return this.getVeiculo.execute({ veiculoId })
  }
}
