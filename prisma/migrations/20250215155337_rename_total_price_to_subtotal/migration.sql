/*
  Warnings:

  - You are about to drop the column `total_price` on the `orders` table. All the data in the column will be lost.
  - Added the required column `subtotal_price` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" RENAME COLUMN "total_price" TO "subtotal_price";