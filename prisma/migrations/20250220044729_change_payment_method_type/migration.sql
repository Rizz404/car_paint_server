/*
  Warnings:

  - The values [BANK_TRANSFER,CREDIT_CARD,RETAIL_OUTLET,QRIS] on the enum `PaymentMethodType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethodType_new" AS ENUM ('CARD', 'DIRECT_DEBIT', 'EWALLET', 'OVER_THE_COUNTER', 'QR_CODE', 'VIRTUAL_ACCOUNT', 'UNKNOWN_ENUM_VALUE');
ALTER TABLE "payment_methods" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "payment_methods" ALTER COLUMN "type" TYPE "PaymentMethodType_new" USING ("type"::text::"PaymentMethodType_new");
ALTER TYPE "PaymentMethodType" RENAME TO "PaymentMethodType_old";
ALTER TYPE "PaymentMethodType_new" RENAME TO "PaymentMethodType";
DROP TYPE "PaymentMethodType_old";
ALTER TABLE "payment_methods" ALTER COLUMN "type" SET DEFAULT 'EWALLET';
COMMIT;
