import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../../app.module'
import { PrismaService } from '../../../../core/database/prisma.service'
import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { ClienteRepository } from '../../../clientes/domain/repositories/cliente.repository'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { MaterialRepository } from '../../../estoque/domain/repositories/material.repository'
import { InMemoryServicoRepository } from '../../../servicos/__test__/double/in-memory-servico.repository'
import { ServicoRepository } from '../../../servicos/domain/repositories/servico.repository'
import { Servico } from '../../../servicos/domain/servico'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { VeiculoRepository } from '../../../veiculos/domain/repositories/veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { ItemMaterial } from '../../domain/item-material'
import { ItemServico } from '../../domain/item-servico'
import { OrdemServico } from '../../domain/ordem-servico'
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository'
import { StatusOrcamento } from '../../domain/status-orcamento'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const servicoId = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'
const materialId = '9c858901-8a57-4791-81fe-4c455b099bc9'

function ordemComOrcamento(): OrdemServico {
  const ordem = OrdemServico.create(clienteId, veiculoId, new Date('2026-10-01T10:00:00Z'))
  ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
  ordem.incluirMaterial(
    ItemMaterial.create(materialId, 'Filtro de óleo', Dinheiro.fromReais(25), 2),
  )
  ordem.iniciarDiagnostico()
  ordem.enviarOrcamento(new Date('2026-10-02T10:00:00Z'))
  return ordem
}

describe('POST /ordens-servico', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository
  let gol: Veiculo
  let troca: Servico
  let filtro: Material

  const fakeOrdem = () => ({
    documento: '529.982.247-25',
    veiculoId: gol.id,
    servicoIds: [troca.id],
    materiais: [{ materialId: filtro.id, quantidade: 2 }],
  })

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    const clienteRepository = new InMemoryClienteRepository()
    const veiculoRepository = new InMemoryVeiculoRepository()
    const servicoRepository = new InMemoryServicoRepository()
    const materialRepository = new InMemoryMaterialRepository()

    const maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await clienteRepository.save(maria)
    gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)
    troca = Servico.create('Troca de óleo', 'Com 1L de óleo', Dinheiro.fromReais(150))
    await servicoRepository.save(troca)
    filtro = Material.create('Filtro de óleo', Dinheiro.fromReais(25), 10)
    await materialRepository.save(filtro)

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
      .overrideProvider(ServicoRepository)
      .useValue(servicoRepository)
      .overrideProvider(MaterialRepository)
      .useValue(materialRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 201 com o id e salva a ordem recebida com os itens', async () => {
    const response = await request(app.getHttpServer()).post('/ordens-servico').send(fakeOrdem())

    expect(response.status).toBe(201)

    const ordem = await repository.findById(response.body.id)
    expect(ordem?.status).toBe(StatusOrdemServico.RECEBIDA)
    expect(ordem?.veiculoId).toBe(gol.id)
    expect(ordem?.servicos.map((item) => item.servicoId)).toEqual([troca.id])
    expect(ordem?.materiais.map((item) => item.quantidade)).toEqual([2])
  })

  it('responde 400 quando o veículo não é um id válido', async () => {
    const response = await request(app.getHttpServer())
      .post('/ordens-servico')
      .send({ ...fakeOrdem(), veiculoId: 'ABC1234' })

    expect(response.status).toBe(400)
    expect(repository.ordens).toHaveLength(0)
  })

  it('responde 404 quando o cliente não existe', async () => {
    const response = await request(app.getHttpServer())
      .post('/ordens-servico')
      .send({ ...fakeOrdem(), documento: '111.444.777-35' })

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Cliente não encontrado.')
    expect(repository.ordens).toHaveLength(0)
  })
})

describe('GET /ordens-servico', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com a página pedida e o total em reais', async () => {
    await repository.save(OrdemServico.create(clienteId, veiculoId))
    const segunda = ordemComOrcamento()
    await repository.save(segunda)

    const response = await request(app.getHttpServer())
      .get('/ordens-servico')
      .query({ page: 2, rpp: 1 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      page: 2,
      rpp: 1,
      more: false,
      list: [
        {
          id: segunda.id,
          clienteId,
          veiculoId,
          status: StatusOrdemServico.AGUARDANDO_APROVACAO,
          dataRecebimento: '2026-10-01T10:00:00.000Z',
          total: 200,
        },
      ],
    })
  })

  it('filtra pelo status informado', async () => {
    await repository.save(OrdemServico.create(clienteId, veiculoId))
    const aguardando = ordemComOrcamento()
    await repository.save(aguardando)

    const response = await request(app.getHttpServer())
      .get('/ordens-servico')
      .query({ status: StatusOrdemServico.AGUARDANDO_APROVACAO })

    expect(response.status).toBe(200)
    expect(response.body.list.map((ordem: { id: string }) => ordem.id)).toEqual([aguardando.id])
  })

  it('responde 400 quando o status não existe', async () => {
    const response = await request(app.getHttpServer())
      .get('/ordens-servico')
      .query({ status: 'EM_ALGUM_LUGAR' })

    expect(response.status).toBe(400)
  })
})

describe('GET /ordens-servico/:id', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 200 com a ordem, os itens, o orçamento e os valores em reais', async () => {
    const ordem = ordemComOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).get(`/ordens-servico/${ordem.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: ordem.id,
      clienteId,
      veiculoId,
      status: StatusOrdemServico.AGUARDANDO_APROVACAO,
      dataRecebimento: '2026-10-01T10:00:00.000Z',
      dataInicio: null,
      dataFinalizacao: null,
      dataEntrega: null,
      servicos: [{ servicoId, nome: 'Troca de óleo', preco: 150 }],
      materiais: [
        { materialId, nome: 'Filtro de óleo', precoUnitario: 25, quantidade: 2, subtotal: 50 },
      ],
      orcamentos: [
        {
          valor: 200,
          status: 'PENDENTE',
          dataEnvio: '2026-10-02T10:00:00.000Z',
          dataResposta: null,
        },
      ],
      total: 200,
    })
  })

  it('responde 404 quando a ordem não existe', async () => {
    const response = await request(app.getHttpServer()).get(
      '/ordens-servico/6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d',
    )

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('Ordem de serviço não encontrada.')
  })

  it('responde 400 quando o id não é válido', async () => {
    const response = await request(app.getHttpServer()).get('/ordens-servico/abc')

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Id inválido.')
  })
})

describe('POST /ordens-servico/:id/iniciar-diagnostico', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e move a ordem para diagnóstico', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/iniciar-diagnostico`,
    )

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
  })

  it('responde 422 quando a ordem não está recebida', async () => {
    const ordem = ordemComOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/iniciar-diagnostico`,
    )

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Transição de status inválida.')
  })
})

describe('POST /ordens-servico/:id/enviar-orcamento', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e deixa a ordem aguardando aprovação com o orçamento enviado', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    ordem.incluirServico(ItemServico.create(servicoId, 'Troca de óleo', Dinheiro.fromReais(150)))
    ordem.iniciarDiagnostico()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/enviar-orcamento`,
    )

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.AGUARDANDO_APROVACAO)
    expect(ordem.orcamentos.map((orcamento) => orcamento.valor.reais)).toEqual([150])
  })
})

describe('POST /ordens-servico/:id/itens', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository
  let troca: Servico
  let filtro: Material

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    const servicoRepository = new InMemoryServicoRepository()
    const materialRepository = new InMemoryMaterialRepository()

    troca = Servico.create('Troca de óleo', 'Com 1L de óleo', Dinheiro.fromReais(150))
    await servicoRepository.save(troca)
    filtro = Material.create('Filtro de óleo', Dinheiro.fromReais(25), 10)
    await materialRepository.save(filtro)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .overrideProvider(ServicoRepository)
      .useValue(servicoRepository)
      .overrideProvider(MaterialRepository)
      .useValue(materialRepository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e inclui os serviços e os materiais na ordem', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    await repository.save(ordem)

    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${ordem.id}/itens`)
      .send({ servicoIds: [troca.id], materiais: [{ materialId: filtro.id, quantidade: 2 }] })

    expect(response.status).toBe(204)
    expect(ordem.total.reais).toBe(200)
  })

  it('responde 422 quando o orçamento já foi enviado', async () => {
    const ordem = ordemComOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer())
      .post(`/ordens-servico/${ordem.id}/itens`)
      .send({ servicoIds: [troca.id] })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe('Itens não podem ser alterados após o envio do orçamento.')
  })
})

describe('POST /ordens-servico/:id/aprovar-orcamento', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e move a ordem para execução com o orçamento aprovado', async () => {
    const ordem = ordemComOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/aprovar-orcamento`,
    )

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.EXECUCAO)
    expect(ordem.orcamentos.map((orcamento) => orcamento.status)).toEqual([
      StatusOrcamento.APROVADO,
    ])
  })
})

describe('POST /ordens-servico/:id/rejeitar-orcamento', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e devolve a ordem ao diagnóstico com o orçamento rejeitado', async () => {
    const ordem = ordemComOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/rejeitar-orcamento`,
    )

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
    expect(ordem.orcamentos.map((orcamento) => orcamento.status)).toEqual([
      StatusOrcamento.REJEITADO,
    ])
  })
})

describe('POST /ordens-servico/:id/finalizar', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e finaliza a ordem em execução', async () => {
    const ordem = ordemComOrcamento()
    ordem.aprovarOrcamento()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(
      `/ordens-servico/${ordem.id}/finalizar`,
    )

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.FINALIZADA)
  })
})

describe('POST /ordens-servico/:id/entregar', () => {
  let app: INestApplication
  let repository: InMemoryOrdemServicoRepository

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(OrdemServicoRepository)
      .useValue(repository)
      .compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('responde 204 e entrega a ordem finalizada', async () => {
    const ordem = ordemComOrcamento()
    ordem.aprovarOrcamento()
    ordem.finalizar()
    await repository.save(ordem)

    const response = await request(app.getHttpServer()).post(`/ordens-servico/${ordem.id}/entregar`)

    expect(response.status).toBe(204)
    expect(ordem.status).toBe(StatusOrdemServico.ENTREGUE)
  })
})
