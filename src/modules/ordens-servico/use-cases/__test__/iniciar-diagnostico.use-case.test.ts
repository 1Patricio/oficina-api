import { NotFoundError } from '../../../../shared/domain/not-found-error'
import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { OrdemServico } from '../../domain/ordem-servico'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'
import { IniciarDiagnostico } from '../iniciar-diagnostico.use-case'

const clienteId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
const veiculoId = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'

describe('IniciarDiagnostico', () => {
  let repository: InMemoryOrdemServicoRepository
  let iniciarDiagnostico: IniciarDiagnostico

  beforeEach(() => {
    repository = new InMemoryOrdemServicoRepository()
    iniciarDiagnostico = new IniciarDiagnostico(repository)
  })

  it('move a ordem para diagnóstico e salva', async () => {
    const ordem = OrdemServico.create(clienteId, veiculoId)
    await repository.save(ordem)
    const save = vi.spyOn(repository, 'save')

    await iniciarDiagnostico.execute({ ordemServicoId: ordem.id })

    expect(ordem.status).toBe(StatusOrdemServico.DIAGNOSTICO)
    expect(save).toHaveBeenCalledWith(ordem)
  })

  it('rejeita ordem inexistente', async () => {
    await expect(
      iniciarDiagnostico.execute({ ordemServicoId: '6f1d3c2a-8b4e-4f7a-9c1d-2e3f4a5b6c7d' }),
    ).rejects.toThrow(NotFoundError)
  })
})
