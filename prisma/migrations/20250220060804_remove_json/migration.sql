/*
  Warnings:

  - You are about to drop the column `channel_properties` on the `payment_methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "channel_properties";
