import {
  type NotificacaoOrcamento,
  NotificadorOrcamento,
} from '../../domain/notificadores/notificador-orcamento'

export class InMemoryNotificadorOrcamento extends NotificadorOrcamento {
  readonly notificacoes: NotificacaoOrcamento[] = []
  falhando = false

  notificar(notificacao: NotificacaoOrcamento): Promise<void> {
    if (this.falhando) return Promise.reject(new Error('SMTP indisponível.'))
    this.notificacoes.push(notificacao)
    return Promise.resolve()
  }
}
