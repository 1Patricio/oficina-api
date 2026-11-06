import { createTransport } from 'nodemailer'
import { Dinheiro } from '../../../../../shared/domain/dinheiro'
import { SmtpNotificadorOrcamento } from '../smtp-notificador-orcamento'

describe('SmtpNotificadorOrcamento', () => {
  it('envia ao e-mail do cliente o valor do orçamento da ordem', async () => {
    const transporter = createTransport({ jsonTransport: true })
    const sendMail = vi.spyOn(transporter, 'sendMail')
    const notificador = new SmtpNotificadorOrcamento(transporter, 'oficina@oficina.local')

    await notificador.notificar({
      email: 'maria@email.com',
      nome: 'Maria Silva',
      ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
      valor: Dinheiro.fromReais(150),
    })

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'oficina@oficina.local',
        to: { name: 'Maria Silva', address: 'maria@email.com' },
        subject: 'Orçamento da ordem de serviço 6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
        text: expect.stringContaining('150,00'),
      }),
    )
  })
})
