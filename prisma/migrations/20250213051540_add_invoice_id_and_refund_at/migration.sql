/*
  Warnings:

  - Added the required column `invoice_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "invoice_id" VARCHAR(30) NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "refundedAt" TIMESTAMP(3);
