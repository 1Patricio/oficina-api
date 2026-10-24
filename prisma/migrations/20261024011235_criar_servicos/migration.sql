-- CreateTable
CREATE TABLE "servicos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco_centavos" INTEGER NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servico_materiais" (
    "servico_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "servico_materiais_pkey" PRIMARY KEY ("servico_id","material_id")
);

-- AddForeignKey
ALTER TABLE "servico_materiais" ADD CONSTRAINT "servico_materiais_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servico_materiais" ADD CONSTRAINT "servico_materiais_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
