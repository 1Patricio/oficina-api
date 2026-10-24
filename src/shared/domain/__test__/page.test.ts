import { Page } from '../page'

describe('Page', () => {
  it('indica que há mais páginas e descarta o item extra', () => {
    const page = Page.create({ page: 1, rpp: 2, list: ['a', 'b', 'c'] })
    expect(page.more).toBe(true)
    expect(page.list).toEqual(['a', 'b'])
  })

  it('indica que não há mais páginas quando a lista cabe na página', () => {
    const page = Page.create({ page: 2, rpp: 2, list: ['a', 'b'] })
    expect(page.more).toBe(false)
    expect(page.list).toEqual(['a', 'b'])
  })

  it('converte os itens mantendo os dados da página', () => {
    const page = Page.create({ page: 3, rpp: 2, list: [1, 2, 3] }).map((item) => item * 10)
    expect(page).toMatchObject({ page: 3, rpp: 2, more: true, list: [10, 20] })
  })
})
