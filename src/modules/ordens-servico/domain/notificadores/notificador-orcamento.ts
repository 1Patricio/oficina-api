import type { Dinheiro } from '../../../../shared/domain/dinheiro'

export type NotificacaoOrcamento = {
  email: string
  nome: string
  ordemServicoId: string
  valor: Dinheiro
}

export abstract class NotificadorOrcamento {
  abstract notificar(notificacao: NotificacaoOrcamento): Promise<void>
}
