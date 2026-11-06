import type { Transporter } from 'nodemailer'
import {
  type NotificacaoOrcamento,
  NotificadorOrcamento,
} from '../../domain/notificadores/notificador-orcamento'

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export class SmtpNotificadorOrcamento implements NotificadorOrcamento {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
  ) {}

  async notificar({ email, nome, ordemServicoId, valor }: NotificacaoOrcamento): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: { name: nome, address: email },
      subject: `Orçamento da ordem de serviço ${ordemServicoId}`,
      text: [
        `Olá, ${nome}.`,
        '',
        `O orçamento da ordem de serviço ${ordemServicoId} está pronto: ${reais.format(valor.reais)}.`,
        'Ele aguarda a sua aprovação para iniciarmos o serviço.',
      ].join('\n'),
    })
  }
}
