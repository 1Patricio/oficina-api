import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateVeiculoDTO {
  @IsString()
  placa: string

  @IsNumber()
  ano: number

  @IsString()
  marca: string

  @IsString()
  modelo: string

  @IsOptional()
  @IsUUID()
  clienteId?: string
}
