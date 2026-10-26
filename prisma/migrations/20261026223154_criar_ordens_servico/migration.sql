-- CreateEnum
CREATE TYPE "status_ordem_servico" AS ENUM ('RECEBIDA', 'DIAGNOSTICO', 'AGUARDANDO_APROVACAO', 'EXECUCAO', 'FINALIZADA', 'ENTREGUE');

-- CreateEnum
CREATE TYPE "status_orcamento" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "materiais" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "servicos" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "veiculos" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "veiculo_id" UUID NOT NULL,
    "status" "status_ordem_servico" NOT NULL,
    "data_recebimento" TIMESTAMP(3) NOT NULL,
    "data_inicio" TIMESTAMP(3),
    "data_finalizacao" TIMESTAMP(3),
    "data_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_servico" (
    "ordem_servico_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_centavos" INTEGER NOT NULL,

    CONSTRAINT "itens_servico_pkey" PRIMARY KEY ("ordem_servico_id","servico_id")
);

-- CreateTable
CREATE TABLE "itens_material" (
    "ordem_servico_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_unitario_centavos" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "itens_material_pkey" PRIMARY KEY ("ordem_servico_id","material_id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "ordem_servico_id" UUID NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor_centavos" INTEGER NOT NULL,
    "status" "status_orcamento" NOT NULL,
    "data_envio" TIMESTAMP(3) NOT NULL,
    "data_resposta" TIMESTAMP(3),

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("ordem_servico_id","numero")
);

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_veiculo_id_fkey" FOREIGN KEY ("veiculo_id") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_servico" ADD CONSTRAINT "itens_servico_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_servico" ADD CONSTRAINT "itens_servico_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_material" ADD CONSTRAINT "itens_material_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_material" ADD CONSTRAINT "itens_material_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
