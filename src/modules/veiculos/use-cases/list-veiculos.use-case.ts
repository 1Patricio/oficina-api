import { Injectable } from '@nestjs/common'
import type { Page } from '../../../shared/domain/page'
import { VeiculoRepository } from '../domain/repositories/veiculo.repository'

type Request = {
  page: number
  rpp: number
  term?: string
}

type Response = {
  id: string
  placa: string
  ano: number
  marca: string
  modelo: string
  clienteId: string | null
}

@Injectable()
export class ListVeiculos {
  constructor(private readonly veiculoRepository: VeiculoRepository) {}

  async execute({ page, rpp, term }: Request): Promise<Page<Response>> {
    const veiculos = await this.veiculoRepository.list(page, rpp, term)
    return veiculos.map((veiculo) => ({
      id: veiculo.id,
      placa: veiculo.placa.value,
      ano: veiculo.ano,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      clienteId: veiculo.clienteId,
    }))
  }
}
