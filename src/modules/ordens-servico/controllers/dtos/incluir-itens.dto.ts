import { Type } from 'class-transformer'
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator'
import { MaterialOrdemServicoDTO } from './create-ordem-servico.dto'

export class IncluirItensDTO {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  servicoIds?: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialOrdemServicoDTO)
  materiais?: MaterialOrdemServicoDTO[]
}
