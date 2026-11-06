import { createTransport } from 'nodemailer'
import { Dinheiro } from '../../../../../shared/domain/dinheiro'
import { SmtpNotificadorOrcamento } from '../smtp-notificador-orcamento'

describe('SmtpNotificadorOrcamento', () => {
  it('envia ao e-mail do cliente o veículo, os itens e o total do orçamento', async () => {
    const transporter = createTransport({ jsonTransport: true })
    const sendMail = vi.spyOn(transporter, 'sendMail')
    const notificador = new SmtpNotificadorOrcamento(transporter, 'oficina@oficina.local')

    await notificador.notificar({
      email: 'maria@email.com',
      nome: 'Maria Silva',
      numero: 7,
      veiculo: { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2018 },
      servicos: [{ nome: 'Troca de óleo', preco: Dinheiro.fromReais(100) }],
      materiais: [{ nome: 'Filtro de óleo', quantidade: 2, subtotal: Dinheiro.fromReais(50) }],
      valor: Dinheiro.fromReais(150),
    })

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'oficina@oficina.local',
        to: { name: 'Maria Silva', address: 'maria@email.com' },
        subject: 'Orçamento da ordem de serviço nº 7',
        html: expect.stringMatching(/Filtro de óleo<\/td>\s*<td[^>]*>2<\/td>\s*<td[^>]*>R\$ 50,00/),
        text: expect.stringContaining(
          [
            'Veículo: Fiat Uno 2018 (placa ABC1D23)',
            '',
            '- Troca de óleo: R$ 100,00',
            '- 2x Filtro de óleo: R$ 50,00',
            '',
            'Total: R$ 150,00',
          ].join('\n'),
        ),
      }),
    )
  })
})
