-- CreateTable
CREATE TABLE "itens_servico_materiais" (
    "ordem_servico_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "itens_servico_materiais_pkey" PRIMARY KEY ("ordem_servico_id","servico_id","material_id")
);

-- AddForeignKey
ALTER TABLE "itens_servico_materiais" ADD CONSTRAINT "itens_servico_materiais_ordem_servico_id_servico_id_fkey" FOREIGN KEY ("ordem_servico_id", "servico_id") REFERENCES "itens_servico"("ordem_servico_id", "servico_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_servico_materiais" ADD CONSTRAINT "itens_servico_materiais_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

