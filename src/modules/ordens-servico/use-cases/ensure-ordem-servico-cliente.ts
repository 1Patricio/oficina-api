import { Injectable } from '@nestjs/common'
import { Documento } from '../../../shared/domain/documento'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { Placa } from '../../../shared/domain/placa'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { VeiculoRepository } from '../../veiculos/domain/repositories/veiculo.repository'
import { OrdemServicoRepository } from '../domain/repositories/ordem-servico.repository'

type Request = {
  placa: string
  documento: string
  ordemServicoId: string
}

@Injectable()
export class EnsureOrdemServicoCliente {
  constructor(
    private readonly clienteRepository: ClienteRepository,
    private readonly veiculoRepository: VeiculoRepository,
    private readonly ordemServicoRepository: OrdemServicoRepository,
  ) {}

  async execute({ ordemServicoId, documento, placa }: Request): Promise<void> {
    const ordem = await this.ordemServicoRepository.findById(ordemServicoId)
    const veiculo = await this.veiculoRepository.findByPlaca(Placa.create(placa))
    const cliente = await this.clienteRepository.findByDocumento(Documento.create(documento))

    const ordemDoCliente =
      ordem &&
      cliente &&
      veiculo &&
      ordem.veiculoId === veiculo.id &&
      ordem.clienteId === cliente.id

    if (!ordemDoCliente) throw new NotFoundError('Ordem de serviço não encontrada.')
  }
}
