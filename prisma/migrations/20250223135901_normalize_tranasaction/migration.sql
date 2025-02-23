/*
  Warnings:

  - You are about to drop the column `failure_return_url` on the `payment_methods` table. All the data in the column will be lost.
  - You are about to drop the column `success_return_url` on the `payment_methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "note" DROP NOT NULL;

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "failure_return_url",
DROP COLUMN "success_return_url";

-- CreateTable
CREATE TABLE "ewallet_payment_configs" (
    "id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "channel_code" VARCHAR(50) NOT NULL,
    "success_return_url" TEXT,
    "failure_return_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ewallet_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_account_configs" (
    "id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "bank_code" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_pattern" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_account_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_details" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "invoice_url" TEXT,
    "mobile_url" TEXT,
    "web_url" TEXT,
    "deeplink_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellations" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "reason" "CancellationReason" NOT NULL,
    "notes" TEXT,
    "cancelled_by_id" VARCHAR(30) NOT NULL,
    "cancelled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "refunded_by_id" VARCHAR(30) NOT NULL,
    "refunded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ewallet_payment_configs_payment_method_id_key" ON "ewallet_payment_configs"("payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_account_configs_payment_method_id_key" ON "virtual_account_configs"("payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_details_transaction_id_key" ON "payment_details"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "cancellations_transaction_id_key" ON "cancellations"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_transaction_id_key" ON "refunds"("transaction_id");

-- AddForeignKey
ALTER TABLE "ewallet_payment_configs" ADD CONSTRAINT "ewallet_payment_configs_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_account_configs" ADD CONSTRAINT "virtual_account_configs_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_refunded_by_id_fkey" FOREIGN KEY ("refunded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
