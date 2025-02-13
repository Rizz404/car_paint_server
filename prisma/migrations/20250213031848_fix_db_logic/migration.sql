/*
  Warnings:

  - The values [PENDING,ACCEPTED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELLED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [FINALQC,DONE] on the enum `WorkStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `order_id` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "orders" ALTER COLUMN "order_status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "order_status" TYPE "OrderStatus_new" USING ("order_status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "order_status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'EXPIRED', 'FAILED', 'REFUNDED');
ALTER TABLE "transactions" ALTER COLUMN "payment_status" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "payment_status" TYPE "PaymentStatus_new" USING ("payment_status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "transactions" ALTER COLUMN "payment_status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WorkStatus_new" AS ENUM ('QUEUED', 'INSPECTION', 'PUTTY', 'SURFACER', 'APPLICATION_COLOR_BASE', 'APPLICATION_CLEAR_COAT', 'POLISHING', 'FINAL_QC', 'COMPLETED');
ALTER TABLE "orders" ALTER COLUMN "work_status" TYPE "WorkStatus_new" USING ("work_status"::text::"WorkStatus_new");
ALTER TYPE "WorkStatus" RENAME TO "WorkStatus_old";
ALTER TYPE "WorkStatus_new" RENAME TO "WorkStatus";
DROP TYPE "WorkStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_order_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "transaction_id" VARCHAR(30) NOT NULL,
ALTER COLUMN "order_status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "order_id";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
