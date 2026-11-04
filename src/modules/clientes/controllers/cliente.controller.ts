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
} from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateCliente } from '../use-cases/create-cliente.use-case'
import { DeleteCliente } from '../use-cases/delete-cliente.use-case'
import { GetCliente } from '../use-cases/get-cliente.use-case'
import { ListClientes } from '../use-cases/list-clientes.use-case'
import { UpdateCliente } from '../use-cases/update-cliente.use-case'
import { CreateClienteDTO } from './dtos/create-cliente.dto'
import { ListClientesQueryDTO } from './dtos/list-clientes-query.dto'
import { UpdateClienteDTO } from './dtos/update-cliente.dto'

@Controller('/clientes')
export class ClienteController {
  @Inject(CreateCliente)
  private readonly createCliente: CreateCliente

  @Inject(ListClientes)
  private readonly listClientes: ListClientes

  @Inject(GetCliente)
  private readonly getCliente: GetCliente

  @Inject(UpdateCliente)
  private readonly updateCliente: UpdateCliente

  @Inject(DeleteCliente)
  private readonly deleteCliente: DeleteCliente

  @Post('/')
  create(@Body() cliente: CreateClienteDTO) {
    return this.createCliente.execute(cliente)
  }

  @Get('/')
  list(@Query() query: ListClientesQueryDTO) {
    return this.listClientes.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }

  @Get('/:id')
  get(@Param('id', ParseIdPipe) clienteId: string) {
    return this.getCliente.execute({ clienteId })
  }

  @Put('/:id')
  @HttpCode(204)
  update(@Param('id', ParseIdPipe) clienteId: string, @Body() cliente: UpdateClienteDTO) {
    return this.updateCliente.execute({ clienteId, ...cliente })
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id', ParseIdPipe) clienteId: string) {
    return this.deleteCliente.execute({ clienteId })
  }
}
