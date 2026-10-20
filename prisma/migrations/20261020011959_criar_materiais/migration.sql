-- CreateTable
CREATE TABLE "materiais" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "preco_unitario_centavos" INTEGER NOT NULL,
    "estoque" INTEGER NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);
