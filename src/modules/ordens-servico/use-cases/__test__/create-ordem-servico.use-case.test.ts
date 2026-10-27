import { Dinheiro } from '../../../../shared/domain/dinheiro'
import { Documento } from '../../../../shared/domain/documento'
import { DomainError } from '../../../../shared/domain/domain-error'
import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { Placa } from '../../../../shared/domain/placa'
import { InMemoryClienteRepository } from '../../../clientes/__test__/double/in-memory-cliente.repository'
import { Cliente } from '../../../clientes/domain/cliente'
import { InMemoryMaterialRepository } from '../../../estoque/__test__/double/in-memory-material.repository'
import { Material } from '../../../estoque/domain/material'
import { InMemoryServicoRepository } from '../../../servicos/__test__/double/in-memory-servico.repository'
import { Servico } from '../../../servicos/domain/servico'
import { InMemoryVeiculoRepository } from '../../../veiculos/__test__/double/in-memory-veiculo.repository'
import { Veiculo } from '../../../veiculos/domain/veiculo'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { CreateOrdemServico } from '../create-ordem-servico.use-case'

const idInexistente = '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d'

describe('CreateOrdemServico', () => {
  let repository: InMemoryOrdemServicoRepository
  let clienteRepository: InMemoryClienteRepository
  let veiculoRepository: InMemoryVeiculoRepository
  let servicoRepository: InMemoryServicoRepository
  let materialRepository: InMemoryMaterialRepository
  let createOrdemServico: CreateOrdemServico
  let maria: Cliente
  let gol: Veiculo

  beforeEach(async () => {
    repository = new InMemoryOrdemServicoRepository()
    clienteRepository = new InMemoryClienteRepository()
    veiculoRepository = new InMemoryVeiculoRepository()
    servicoRepository = new InMemoryServicoRepository()
    materialRepository = new InMemoryMaterialRepository()
    createOrdemServico = new CreateOrdemServico(
      repository,
      clienteRepository,
      veiculoRepository,
      servicoRepository,
      materialRepository,
    )

    maria = Cliente.create(Documento.create('529.982.247-25'), 'Maria Silva')
    await clienteRepository.save(maria)
    gol = Veiculo.create(Placa.create('ABC1234'), 2010, 'Volkswagen', 'Gol', maria.id)
    await veiculoRepository.save(gol)
  })

  it('abre a ordem como recebida para o cliente e o veículo e devolve o id', async () => {
    const { id } = await createOrdemServico.execute({
      documento: '529.982.247-25',
      veiculoId: gol.id,
    })

    const salva = await repository.findById(id)
    expect(salva?.status).toBe(StatusOrdemServico.RECEBIDA)
    expect(salva?.clienteId).toBe(maria.id)
    expect(salva?.veiculoId).toBe(gol.id)
    expect(salva?.servicos).toHaveLength(0)
    expect(salva?.materiais).toHaveLength(0)
  })

  it('inclui serviços e materiais com o nome e o preço do catálogo', async () => {
    const troca = Servico.create('Troca de óleo', 'Com 1L de óleo', Dinheiro.fromReais(150))
    await servicoRepository.save(troca)
    const filtro = Material.create('Filtro de óleo', Dinheiro.fromReais(25), 10)
    await materialRepository.save(filtro)

    const { id } = await createOrdemServico.execute({
      documento: '529.982.247-25',
      veiculoId: gol.id,
      servicoIds: [troca.id],
      materiais: [{ materialId: filtro.id, quantidade: 3 }],
    })

    const salva = await repository.findById(id)
    expect(salva?.servicos[0]?.nome).toBe('Troca de óleo')
    expect(salva?.materiais[0]?.nome).toBe('Filtro de óleo')
    expect(salva?.materiais[0]?.quantidade).toBe(3)
    expect(salva?.total.cents).toBe(22500)
  })

  it('aceita veículo sem cliente vinculado', async () => {
    const semDono = Veiculo.create(Placa.create('XYZ9876'), 2015, 'Fiat', 'Uno')
    await veiculoRepository.save(semDono)

    const { id } = await createOrdemServico.execute({
      documento: '529.982.247-25',
      veiculoId: semDono.id,
    })

    expect((await repository.findById(id))?.veiculoId).toBe(semDono.id)
  })

  it('rejeita cliente inexistente sem salvar', async () => {
    await expect(
      createOrdemServico.execute({ documento: '111.444.777-35', veiculoId: gol.id }),
    ).rejects.toThrow(NotFoundError)
    expect(repository.ordens).toHaveLength(0)
  })

  it('rejeita veículo inexistente sem salvar', async () => {
    await expect(
      createOrdemServico.execute({ documento: '529.982.247-25', veiculoId: idInexistente }),
    ).rejects.toThrow(NotFoundError)
    expect(repository.ordens).toHaveLength(0)
  })

  it('rejeita veículo de outro cliente sem salvar', async () => {
    const joao = Cliente.create(Documento.create('111.444.777-35'), 'João Souza')
    await clienteRepository.save(joao)

    await expect(
      createOrdemServico.execute({ documento: '111.444.777-35', veiculoId: gol.id }),
    ).rejects.toThrow(DomainError)
    expect(repository.ordens).toHaveLength(0)
  })

  it('rejeita serviço inexistente sem salvar', async () => {
    await expect(
      createOrdemServico.execute({
        documento: '529.982.247-25',
        veiculoId: gol.id,
        servicoIds: [idInexistente],
      }),
    ).rejects.toThrow(NotFoundError)
    expect(repository.ordens).toHaveLength(0)
  })

  it('rejeita material inexistente sem salvar', async () => {
    await expect(
      createOrdemServico.execute({
        documento: '529.982.247-25',
        veiculoId: gol.id,
        materiais: [{ materialId: idInexistente, quantidade: 1 }],
      }),
    ).rejects.toThrow(NotFoundError)
    expect(repository.ordens).toHaveLength(0)
  })
})
