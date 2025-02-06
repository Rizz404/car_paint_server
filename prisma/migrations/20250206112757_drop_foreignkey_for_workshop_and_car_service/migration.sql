/*
  Warnings:

  - You are about to drop the column `workshopId` on the `CarService` table. All the data in the column will be lost.
  - You are about to drop the column `carBrandId` on the `Workshop` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CarService" DROP CONSTRAINT "CarService_workshopId_fkey";

-- DropForeignKey
ALTER TABLE "Workshop" DROP CONSTRAINT "Workshop_carBrandId_fkey";

-- DropIndex
DROP INDEX "Workshop_carBrandId_idx";

-- AlterTable
ALTER TABLE "CarService" DROP COLUMN "workshopId";

-- AlterTable
ALTER TABLE "Workshop" DROP COLUMN "carBrandId";
