import { randomUUID } from 'node:crypto'
import { DomainError } from '../../../shared/domain/domain-error'
import { Entity } from '../../../shared/domain/entity'
import { Placa } from '../../../shared/domain/placa'

export class Veiculo extends Entity {
  private constructor(
    id: string,
    private _placa: Placa,
    private _ano: number,
    private _marca: string,
    private _modelo: string,
    private _clienteId: string | null,
    private _deletedAt: Date | null,
  ) {
    super(id)
    validateMarcaModelo(_marca, _modelo)
  }

  static create(
    placa: Placa,
    ano: number,
    marca: string,
    modelo: string,
    clienteId: string | null = null,
  ): Veiculo {
    return new Veiculo(randomUUID(), placa, ano, marca, modelo, clienteId, null)
  }

  static restore(
    id: string,
    placa: Placa,
    ano: number,
    marca: string,
    modelo: string,
    clienteId: string | null,
    deletedAt: Date | null,
  ): Veiculo {
    return new Veiculo(id, placa, ano, marca, modelo, clienteId, deletedAt)
  }

  get placa(): Placa {
    return this._placa
  }

  get ano(): number {
    return this._ano
  }

  get marca(): string {
    return this._marca
  }

  get modelo(): string {
    return this._modelo
  }

  get clienteId(): string | null {
    return this._clienteId
  }

  get deletedAt(): Date | null {
    return this._deletedAt
  }

  update(placa: Placa, ano: number, marca: string, modelo: string, clienteId: string | null): void {
    validateMarcaModelo(marca, modelo)

    this._placa = placa
    this._ano = ano
    this._marca = marca
    this._modelo = modelo
    this._clienteId = clienteId
  }

  delete(data: Date = new Date()): void {
    this._deletedAt = data
  }
}

function validateMarcaModelo(marca: string, modelo: string): void {
  if (marca.trim() === '') throw new DomainError('Marca não informada.')
  if (modelo.trim() === '') throw new DomainError('Modelo não informado.')
}
