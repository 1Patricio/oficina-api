import { Injectable } from '@nestjs/common'
import type { Dinheiro } from '../../../shared/domain/dinheiro'
import { NotFoundError } from '../../../shared/domain/not-found-error'
import { NotificacaoError } from '../../../shared/domain/notificacao-error'
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository'
import { VeiculoRepository } from '../../veiculos/domain/repositories/veiculo.repository'
import { NotificadorOrcamento } from '../domain/notificadores/notificador-orcamento'
import type { OrdemServico } from '../domain/ordem-servico'

@Injectable()
export class NotificarOrcamentoCliente {
  constructor(
    private readonly clienteRepository: ClienteRepository,
    private readonly veiculoRepository: VeiculoRepository,
    private readonly notificadorOrcamento: NotificadorOrcamento,
  ) {}

  async execute(ordem: OrdemServico, valor: Dinheiro): Promise<void> {
    const cliente = await this.clienteRepository.findById(ordem.clienteId)
    if (!cliente) throw new NotFoundError('Cliente não encontrado.')

    const veiculo = await this.veiculoRepository.findById(ordem.veiculoId)
    if (!veiculo) throw new NotFoundError('Veículo não encontrado.')

    if (!cliente.email) {
      throw new NotificacaoError(
        'Orçamento gerado, mas o e-mail não foi enviado: cliente sem e-mail cadastrado.',
      )
    }

    try {
      await this.notificadorOrcamento.notificar({
        email: cliente.email,
        nome: cliente.nome,
        numero: ordem.numero,
        veiculo: {
          placa: veiculo.placa.value,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano,
        },
        servicos: ordem.servicos.map(({ nome, preco }) => ({ nome, preco })),
        materiais: ordem.materiais.map(({ nome, quantidade, subtotal }) => ({
          nome,
          quantidade,
          subtotal,
        })),
        valor,
      })
    } catch {
      throw new NotificacaoError(
        'Orçamento gerado, mas o e-mail não foi enviado: falha no servidor de e-mail.',
      )
    }
  }
}
