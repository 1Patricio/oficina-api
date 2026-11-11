import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../core/jwt-auth.guard'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateVeiculo } from '../use-cases/create-veiculo.use-case'
import { DeleteVeiculo } from '../use-cases/delete-veiculo.use-case'
import { GetVeiculo } from '../use-cases/get-veiculo.use-case'
import { ListVeiculos } from '../use-cases/list-veiculos.use-case'
import { UpdateVeiculo } from '../use-cases/update-veiculo.use-case'
import { CreateVeiculoDTO } from './dtos/create-veiculo.dto'
import { ListVeiculosQueryDTO } from './dtos/list-veiculos-query.dto'
import { UpdateVeiculoDTO } from './dtos/update-veiculo.dto'

@Controller('/veiculos')
@UseGuards(JwtAuthGuard)
export class VeiculoController {
  @Inject(CreateVeiculo)
  private readonly createVeiculo: CreateVeiculo

  @Inject(ListVeiculos)
  private readonly listVeiculos: ListVeiculos

  @Inject(GetVeiculo)
  private readonly getVeiculo: GetVeiculo

  @Inject(UpdateVeiculo)
  private readonly updateVeiculo: UpdateVeiculo

  @Inject(DeleteVeiculo)
  private readonly deleteVeiculo: DeleteVeiculo

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

  @Put('/:id')
  @HttpCode(204)
  update(@Param('id', ParseIdPipe) veiculoId: string, @Body() veiculo: UpdateVeiculoDTO) {
    return this.updateVeiculo.execute({ veiculoId, ...veiculo })
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id', ParseIdPipe) veiculoId: string) {
    return this.deleteVeiculo.execute({ veiculoId })
  }
}
