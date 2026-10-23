/*
  Warnings:

  - A unique constraint covering the columns `[placa]` on the table `veiculos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placa` to the `veiculos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "veiculos" ADD COLUMN     "placa" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");
