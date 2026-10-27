import { IsEnum, IsOptional } from 'class-validator'
import { PageQueryDTO } from '../../../../core/page-query.dto'
import { StatusOrdemServico } from '../../domain/status-ordem-servico'

export class ListOrdensServicoQueryDTO extends PageQueryDTO {
  @IsOptional()
  @IsEnum(StatusOrdemServico)
  status?: StatusOrdemServico
}
