import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../../core/jwt-auth.guard'
import { ParseIdPipe } from '../../../core/parse-id.pipe'
import { CreateMaterial } from '../use-cases/create-material.use-case'
import { DeleteMaterial } from '../use-cases/delete-material.use-case'
import { GetMaterial } from '../use-cases/get-material.use-case'
import { ListMateriais } from '../use-cases/list-materiais.use-case'
import { ReporEstoque } from '../use-cases/repor-estoque.use-case'
import { UpdateMaterial } from '../use-cases/update-material.use-case'
import { CreateMaterialDTO } from './dtos/create-material.dto'
import { ListMateriaisQueryDTO } from './dtos/list-materiais-query.dto'
import { ReporEstoqueDTO } from './dtos/repor-estoque.dto'
import { UpdateMaterialDTO } from './dtos/update-material.dto'

@Controller('/materiais')
@UseGuards(JwtAuthGuard)
export class MaterialController {
  @Inject(CreateMaterial)
  private readonly createMaterial: CreateMaterial

  @Inject(ListMateriais)
  private readonly listMateriais: ListMateriais

  @Inject(GetMaterial)
  private readonly getMaterial: GetMaterial

  @Inject(UpdateMaterial)
  private readonly updateMaterial: UpdateMaterial

  @Inject(DeleteMaterial)
  private readonly deleteMaterial: DeleteMaterial

  @Inject(ReporEstoque)
  private readonly reporEstoque: ReporEstoque

  @Post('/')
  create(@Body() material: CreateMaterialDTO) {
    return this.createMaterial.execute(material)
  }

  @Get('/')
  list(@Query() query: ListMateriaisQueryDTO) {
    return this.listMateriais.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }

  @Get('/:id')
  get(@Param('id', ParseIdPipe) materialId: string) {
    return this.getMaterial.execute({ materialId })
  }

  @Put('/:id')
  @HttpCode(204)
  update(@Param('id', ParseIdPipe) materialId: string, @Body() material: UpdateMaterialDTO) {
    return this.updateMaterial.execute({ materialId, ...material })
  }

  @Delete('/:id')
  @HttpCode(204)
  delete(@Param('id', ParseIdPipe) materialId: string) {
    return this.deleteMaterial.execute({ materialId })
  }

  @Post('/:id/reposicao')
  @HttpCode(204)
  repor(@Param('id', ParseIdPipe) materialId: string, @Body() reposicao: ReporEstoqueDTO) {
    return this.reporEstoque.execute({ materialId, ...reposicao })
  }
}
