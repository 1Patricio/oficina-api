import type { Dinheiro } from '../../../../shared/domain/dinheiro'

export type NotificacaoOrcamento = {
  email: string
  nome: string
  numero: number
  veiculo: { placa: string; marca: string; modelo: string; ano: number }
  servicos: { nome: string; preco: Dinheiro }[]
  materiais: { nome: string; quantidade: number; subtotal: Dinheiro }[]
  valor: Dinheiro
}

export abstract class NotificadorOrcamento {
  abstract notificar(notificacao: NotificacaoOrcamento): Promise<void>
}
