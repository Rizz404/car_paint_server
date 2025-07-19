/*
  Warnings:

  - You are about to drop the column `xendit_invoice_id` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `xendit_payment_method_id` on the `payment_details` table. All the data in the column will be lost.
  - You are about to drop the column `xendit_payment_request_id` on the `payment_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment_details" DROP COLUMN "xendit_invoice_id",
DROP COLUMN "xendit_payment_method_id",
DROP COLUMN "xendit_payment_request_id";
