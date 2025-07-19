/*
  Warnings:

  - You are about to drop the `ewallet_payment_configs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `virtual_account_configs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ewallet_payment_configs" DROP CONSTRAINT "ewallet_payment_configs_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "virtual_account_configs" DROP CONSTRAINT "virtual_account_configs_payment_method_id_fkey";

-- AlterTable
ALTER TABLE "payment_details" ADD COLUMN     "midtrans_expiry_time" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "bank_code" VARCHAR(50),
ADD COLUMN     "callback_url" TEXT,
ADD COLUMN     "channel_code" VARCHAR(50),
ADD COLUMN     "failure_return_url" TEXT,
ADD COLUMN     "store_name" VARCHAR(50),
ADD COLUMN     "success_return_url" TEXT;

-- DropTable
DROP TABLE "ewallet_payment_configs";

-- DropTable
DROP TABLE "virtual_account_configs";
