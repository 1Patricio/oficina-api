import { IsNumber, IsString } from 'class-validator'

export class CreateVeiculoDTO {
  @IsNumber()
  ano: number

  @IsString()
  marca: string

  @IsString()
  modelo: string
}
