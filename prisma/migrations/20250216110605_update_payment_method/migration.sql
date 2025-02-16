-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('EWALLET', 'BANK_TRANSFER', 'CREDIT_CARD', 'RETAIL_OUTLET', 'QRIS');

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "type" "PaymentMethodType" NOT NULL DEFAULT 'EWALLET',
ADD COLUMN     "xendit_payment_method_id" VARCHAR(100);
