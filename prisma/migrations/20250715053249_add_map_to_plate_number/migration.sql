/*
  Warnings:

  - You are about to drop the column `plateNumber` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "plateNumber",
ADD COLUMN     "plate_number" TEXT;
