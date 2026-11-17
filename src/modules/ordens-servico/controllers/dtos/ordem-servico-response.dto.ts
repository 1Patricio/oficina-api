import { StatusOrcamento } from '../../domain/status-orcamento'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

export class CreateOrdemServicoResponseDTO {
  id: string
}

export class OrdemServicoResumoResponseDTO {
  id: string
  numero: number
  clienteId: string
  veiculoId: string
  status: StatusOrdemServico
  dataRecebimento: Date
  total: number
}

export class ListOrdensServicoResponseDTO {
  page: number
  rpp: number
  more: boolean
  list: OrdemServicoResumoResponseDTO[]
}

export class ItemServicoResponseDTO {
  servicoId: string
  nome: string
  preco: number
}

export class ItemMaterialResponseDTO {
  materialId: string
  nome: string
  precoUnitario: number
  quantidade: number
  subtotal: number
}

export class OrcamentoResponseDTO {
  valor: number
  status: StatusOrcamento
  dataEnvio: Date
  dataResposta: Date | null
}

export class OrdemServicoResponseDTO {
  id: string
  numero: number
  clienteId: string
  veiculoId: string
  status: StatusOrdemServico
  dataRecebimento: Date
  dataInicio: Date | null
  dataFinalizacao: Date | null
  dataEntrega: Date | null
  servicos: ItemServicoResponseDTO[]
  materiais: ItemMaterialResponseDTO[]
  orcamentos: OrcamentoResponseDTO[]
  total: number
}

export class TempoMedioResponseDTO {
  tempoMedioMinutos: number | null
}
