-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL,
    "documento" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_documento_key" ON "clientes"("documento");
