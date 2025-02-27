/*
  Warnings:

  - You are about to drop the column `channel_code` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `cancellation_notes` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `cancellation_reason` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_by` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_url` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_invoice_url` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method_fee` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `refund_amount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `refunded_at` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `web_url` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_details" ADD COLUMN     "xendit_invoice_id" TEXT;

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "channel_code";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "cancellation_notes",
DROP COLUMN "cancellation_reason",
DROP COLUMN "cancelled_by",
DROP COLUMN "invoice_id",
DROP COLUMN "mobile_url",
DROP COLUMN "payment_invoice_url",
DROP COLUMN "payment_method_fee",
DROP COLUMN "refund_amount",
DROP COLUMN "refunded_at",
DROP COLUMN "web_url";
