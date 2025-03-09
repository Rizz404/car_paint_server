-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "maximum_payment" DECIMAL(10,2) NOT NULL DEFAULT 10000000,
ADD COLUMN     "minimum_payment" DECIMAL(10,2) NOT NULL DEFAULT 0;
