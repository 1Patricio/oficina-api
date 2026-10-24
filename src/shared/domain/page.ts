type CreateProps<T> = {
  page: number
  rpp: number
  list: T[]
}

export class Page<T> {
  private constructor(
    readonly page: number,
    readonly rpp: number,
    readonly more: boolean,
    readonly list: T[],
  ) {}

  static create<T>({ page, rpp, list }: CreateProps<T>): Page<T> {
    return new Page(page, rpp, list.length > rpp, list.slice(0, rpp))
  }

  map<U>(convert: (item: T) => U): Page<U> {
    return new Page(
      this.page,
      this.rpp,
      this.more,
      this.list.map((item) => convert(item)),
    )
  }
}
