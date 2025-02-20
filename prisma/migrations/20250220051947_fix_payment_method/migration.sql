/*
  Warnings:

  - You are about to drop the column `xendit_payment_method_id` on the `payment_methods` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentReusability" AS ENUM ('ONE_TIME_USE', 'MULTIPLE_USE');

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "xendit_payment_method_id",
ADD COLUMN     "channel_code" VARCHAR(50),
ADD COLUMN     "channel_properties" JSONB,
ADD COLUMN     "failure_return_url" TEXT,
ADD COLUMN     "reusability" "PaymentReusability" NOT NULL DEFAULT 'ONE_TIME_USE',
ADD COLUMN     "success_return_url" TEXT;
