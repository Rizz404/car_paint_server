/*
  Warnings:

  - Made the column `work_status` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "work_status" SET NOT NULL,
ALTER COLUMN "work_status" SET DEFAULT 'QUEUED';
