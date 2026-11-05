import { InMemoryOrdemServicoRepository } from '../../__test__/double/in-memory-ordem-servico.repository'
import { GetTempoMedio } from '../get-tempo-medio.use-case'

describe('GetTempoMedio', () => {
  let repository: InMemoryOrdemServicoRepository
  let getTempoMedio: GetTempoMedio

  beforeEach(() => {
    repository = new InMemoryOrdemServicoRepository()
    getTempoMedio = new GetTempoMedio(repository)
  })

  it('devolve o tempo médio arredondado em minutos', async () => {
    repository.tempoMedioExecucaoMinutos = 90.4

    await expect(getTempoMedio.execute()).resolves.toEqual({ tempoMedioMinutos: 90 })
  })

  it('devolve nulo quando nenhuma ordem foi finalizada', async () => {
    await expect(getTempoMedio.execute()).resolves.toEqual({ tempoMedioMinutos: null })
  })
})
