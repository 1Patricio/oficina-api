import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { MaterialNecessarioDTO } from './create-servico.dto'

export class UpdateServicoDTO {
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
