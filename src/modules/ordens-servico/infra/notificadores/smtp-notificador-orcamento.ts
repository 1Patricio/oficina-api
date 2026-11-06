import { join } from 'node:path'
import { renderFile } from 'ejs'
import type { Transporter } from 'nodemailer'
import {
  type NotificacaoOrcamento,
  NotificadorOrcamento,
} from '../../domain/notificadores/notificador-orcamento'

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const template = join(__dirname, 'templates', 'orcamento.ejs')

export class SmtpNotificadorOrcamento implements NotificadorOrcamento {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
  ) {}

  async notificar({
    email,
    nome,
    numero,
    veiculo,
    servicos,
    materiais,
    valor,
  }: NotificacaoOrcamento): Promise<void> {
    const linhasServicos = servicos.map(
      (servico) => `- ${servico.nome}: ${reais.format(servico.preco.reais)}`,
    )
    const linhasMateriais = materiais.map(
      (material) =>
        `- ${material.quantidade}x ${material.nome}: ${reais.format(material.subtotal.reais)}`,
    )

    const html = await renderFile(template, {
      nome,
      numero,
      veiculo,
      itens: [
        ...servicos.map((servico) => ({
          descricao: servico.nome,
          quantidade: 1,
          valor: reais.format(servico.preco.reais),
        })),
        ...materiais.map((material) => ({
          descricao: material.nome,
          quantidade: material.quantidade,
          valor: reais.format(material.subtotal.reais),
        })),
      ],
      total: reais.format(valor.reais),
    })

    await this.transporter.sendMail({
      from: this.from,
      to: { name: nome, address: email },
      subject: `Orçamento da ordem de serviço nº ${numero}`,
      html,
      text: [
        `Olá, ${nome}.`,
        '',
        `O orçamento da ordem de serviço nº ${numero} está pronto.`,
        `Veículo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} (placa ${veiculo.placa})`,
        '',
        ...linhasServicos,
        ...linhasMateriais,
        '',
        `Total: ${reais.format(valor.reais)}`,
        '',
        'Ele aguarda a sua aprovação para iniciarmos o serviço.',
      ].join('\n'),
    })
  }
}
