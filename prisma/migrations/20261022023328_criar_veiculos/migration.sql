-- CreateTable
CREATE TABLE "veiculos" (
    "id" UUID NOT NULL,
    "ano" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);
