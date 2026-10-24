import { Type } from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'

export class MaterialNecessarioDTO {
  @IsUUID()
  materialId: string

  @IsInt()
  quantidade: number
}

export class CreateServicoDTO {
  @IsString()
  nome: string

  @IsString()
  descricao: string

  @IsNumber()
  preco: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialNecessarioDTO)
  materiais?: MaterialNecessarioDTO[]
}
