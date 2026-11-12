import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { InMemoryTransactionManager } from '../../../../shared/__test__/double/in-memory-transaction-manager'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { Placa } from '../../../../shared/domain/placa'
import { TransactionManager } from '../../../../shared/domain/transaction-manager'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { ClienteRepository } from '../../../clientes/domain/repositories/cliente.repository'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { MaterialRepository } from '../../../estoque/domain/repositories/material.repository'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { VeiculoRepository } from '../../../veiculos/domain/repositories/veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
const materialId = '9c858901-8a57-4791-81fe-4c455b099bc9'

function ordemAguardandoAprovacao(cliente: Cliente, veiculo: Veiculo): OrdemServico {
  const ordem = OrdemServico.create(cliente.id, veiculo.id)
  ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
  ordem.iniciarDiagnostico()
  ordem.enviarOrcamento()
  return ordem
}

describe('GET /public/ordens-servico', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository
  let maria: Cliente
  let gol: Veiculo

  const consulta = { documento: '529.982.247-25', placa: 'ABC1234' }

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()

    maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva', 'maria@email.com')
    await clienteRepository.save(maria)
    gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .overrideProvider(ClienteRepository)
      .useValue(clienteRepository)
      .overrideProvider(VeiculoRepository)
      .useValue(veiculoRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com as ordens em JSON, valores em reais e sem ids internos', async () => {
    const ordem = OrdemServico.create(maria.id, gol.id, new Date('2026-10-01T10:00:00Z'))
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.incluirMaterial(
      ItemMaterial.create(materialId, 'Filtro de óleo', Dinheiro.fromReais(25), 2),
    )
    await repository.save(ordem)

    const response = await request(app.getHttpServer())
      .get('/public/ordens-servico')
      .query(consulta)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 1,
      rpp: 20,
      more: false,
      list: [
        {
          id: ordem.id,
          numero: 1,
          status: StatusOrdemServico.RECEBIDA,
          dataRecebimento: '2026-10-01T10:00:00.000Z',
          dataInicio: null,
          dataFinalizacao: null,
          dataEntrega: null,
          servicos: [{ nome: 'Troca de óleo', preco: 150 }],
          materiais: [{ nome: 'Filtro de óleo', precoUnitario: 25, quantidade: 2, subtotal: 50 }],
          orcamentos: [],
          total: 200,
        },
      ],
    })
  })

  it('responde 400 quando a placa não é informada', async () => {
    const response = await request(app.getHttpServer())
      .get('/public/ordens-servico')
      .query({ documento: consulta.documento })

    expect(response.status).toBe(400)
  })

  it('responde 404 quando não há ordem para o documento e a placa', async () => {
    const response = await request(app.getHttpServer())
      .get('/public/ordens-servico')
      .query(consulta)

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Ordem de serviço não encontrada.')
  })
})

describe('POST /public/ordens-servico/:id/aprovar-orcamento', () => {
  let app: INestApplication
  let ordem: OrdemServico

  const identificacao = { documento: '529.982.247-25', placa: 'ABC1234' }

  beforeEach(async () => {
    const repository = new InMemoryOrdemServicoRepository()
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()

    const maria = Cliente.create(
      Documento.create('529.982.247-25'),
      'Maria Silva',
      'maria@email.com',
    )
    const joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza', 'joao@email.com')
    await clienteRepository.save(maria)
    await clienteRepository.save(joao)
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)

    ordem = ordemAguardandoAprovacao(maria, gol)
    await repository.save(ordem)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .overrideProvider(ClienteRepository)
      .useValue(clienteRepository)
      .overrideProvider(VeiculoRepository)
      .useValue(veiculoRepository)
      .overrideProvider(MaterialRepository)
      .useValue(new InMemoryMaterialRepository())
      .overrideProvider(TransactionManager)
      .useValue(new InMemoryTransactionManager())
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e move a ordem do cliente para execução', async () => {
    const response = await request(app.getHttpServer())
      .post(`/public/ordens-servico/${ordem.id}/aprovar-orcamento`)
      .send(identificacao)

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.EXECUCAO)
  })

  it('responde 404 com o documento de outro cliente e não aprova', async () => {
    const response = await request(app.getHttpServer())
      .post(`/public/ordens-servico/${ordem.id}/aprovar-orcamento`)
      .send({ ...identificacao, documento: '111.444.777-35' })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Ordem de serviço não encontrada.')
    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
  })
})

describe('POST /public/ordens-servico/:id/rejeitar-orcamento', () => {
  let app: INestApplication
  let ordem: OrdemServico

  beforeEach(async () => {
    const repository = new InMemoryOrdemServicoRepository()
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()

    const maria = Cliente.create(
      Documento.create('529.982.247-25'),
      'Maria Silva',
      'maria@email.com',
    )
    await clienteRepository.save(maria)
    const gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)

    ordem = ordemAguardandoAprovacao(maria, gol)
    await repository.save(ordem)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .overrideProvider(ClienteRepository)
      .useValue(clienteRepository)
      .overrideProvider(VeiculoRepository)
      .useValue(veiculoRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e volta a ordem do cliente para o diagnóstico', async () => {
    const response = await request(app.getHttpServer())
      .post(`/public/ordens-servico/${ordem.id}/rejeitar-orcamento`)
      .send({ documento: '529.982.247-25', placa: 'ABC1234' })

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
  })
})
