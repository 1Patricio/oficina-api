import { IsNumber, IsString } from 'class-validator'

export class CreateVeiculoDTO {
  @IsString()
  placa: string

  @IsNumber()
  ano: number

  @IsString()
  marca: string

  @IsString()
  modelo: string
}
