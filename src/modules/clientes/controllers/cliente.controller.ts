import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateCliente } from '../use-cases/create-cliente.use-case'
import { GetCliente } from '../use-cases/get-cliente.use-case'
import { ListClientes } from '../use-cases/list-clientes.use-case'
import { CreateClienteDTO } from './dtos/create-cliente.dto'
import { ListClientesQueryDTO } from './dtos/list-clientes-query.dto'

@Controller('/clientes')
export class ClienteController {
  @Inject(CreateCliente)
  private readonly createCliente: CreateCliente

  @Inject(ListClientes)
  private readonly listClientes: ListClientes

  @Inject(GetCliente)
  private readonly getCliente: GetCliente

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
}
