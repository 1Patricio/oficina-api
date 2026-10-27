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
import { OrdemServicoRepository } from '../../domain/repositories/ordem-servico.repository'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

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
