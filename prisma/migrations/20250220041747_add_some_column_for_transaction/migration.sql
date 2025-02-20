/*
  Warnings:

  - You are about to drop the column `paymentInvoiceUrl` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `refundedAt` on the `transactions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('CUSTOMER_REQUEST', 'WORKSHOP_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'SCHEDULING_CONFLICT', 'PAYMENT_ISSUE', 'VEHICLE_ISSUE', 'PRICE_DISAGREEMENT', 'WORKSHOP_OVERBOOKED', 'DUPLICATE_ORDER', 'PARTS_UNAVAILABLE', 'CUSTOMER_NO_SHOW', 'FORCE_MAJEURE', 'SERVICE_INCOMPATIBILITY', 'OTHER');

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "paymentInvoiceUrl",
DROP COLUMN "refundedAt",
ADD COLUMN     "cancellation_notes" TEXT,
ADD COLUMN     "cancellation_reason" "CancellationReason",
ADD COLUMN     "cancelled_by" VARCHAR(30),
ADD COLUMN     "mobile_url" TEXT,
ADD COLUMN     "payment_invoice_url" TEXT,
ADD COLUMN     "refunded_at" TIMESTAMP(3),
ADD COLUMN     "web_url" TEXT;
