import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { CreateMaterial } from '../use-cases/create-material.use-case'
import { ListMateriais } from '../use-cases/list-materiais.use-case'
import { CreateMaterialDTO } from './dtos/create-material.dto'
import { ListMateriaisQueryDTO } from './dtos/list-materiais-query.dto'

@Controller('/materiais')
export class MaterialController {
  @Inject(CreateMaterial)
  private readonly createMaterial: CreateMaterial

  @Inject(ListMateriais)
  private readonly listMateriais: ListMateriais

  @Post('/')
  create(@Body() material: CreateMaterialDTO) {
    return this.createMaterial.execute(material)
  }

  @Get('/')
  list(@Query() query: ListMateriaisQueryDTO) {
    return this.listMateriais.execute({ page: query.page, rpp: query.rpp, term: query.nome })
  }
}
