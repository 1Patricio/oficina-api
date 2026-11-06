import { IsString } from 'class-validator'
import { PageQueryDTO } from '../../../../core/page-query.dto'

export class ListOrdensServicoPublicQueryDTO extends PageQueryDTO {
  @IsString()
  documento: string

  @IsString()
  placa: string
}
