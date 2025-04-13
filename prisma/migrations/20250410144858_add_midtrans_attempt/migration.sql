-- CreateEnum
CREATE TYPE "MidtransTransactionStatus" AS ENUM ('PENDING', 'SETTLEMENT', 'CAPTURE', 'EXPIRE', 'DENY', 'CANCEL', 'FAILURE', 'AUTHORIZE');

-- CreateEnum
CREATE TYPE "MidtransFraudStatus" AS ENUM ('ACCEPT', 'CHALLENGE', 'DENY');

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_payment_method_id_fkey";

-- AlterTable
ALTER TABLE "payment_details" ADD COLUMN     "midtrans_bill_key" VARCHAR(50),
ADD COLUMN     "midtrans_biller_code" VARCHAR(50),
ADD COLUMN     "midtrans_fraud_status" "MidtransFraudStatus",
ADD COLUMN     "midtrans_order_id" VARCHAR(100),
ADD COLUMN     "midtrans_payment_code" VARCHAR(50),
ADD COLUMN     "midtrans_payment_type" VARCHAR(50),
ADD COLUMN     "midtrans_qr_code_url" TEXT,
ADD COLUMN     "midtrans_redirect_url" TEXT,
ADD COLUMN     "midtrans_transaction_id" VARCHAR(100),
ADD COLUMN     "midtrans_transaction_status" "MidtransTransactionStatus";

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "midtrans_identifier" VARCHAR(50);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
