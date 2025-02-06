/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `fee` on the `PaymentMethod` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `latitude` on the `UserProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(9,6)` to `Decimal(10,8)`.
  - You are about to drop the `Transanction` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `year` on the `CarModelYear` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Transanction" DROP CONSTRAINT "Transanction_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Transanction" DROP CONSTRAINT "Transanction_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Transanction" DROP CONSTRAINT "Transanction_userId_fkey";

-- DropIndex
DROP INDEX "User_username_email_idx";

-- DropIndex
DROP INDEX "UserProfile_userId_idx";

-- AlterTable
ALTER TABLE "CarModelYear" DROP COLUMN "year",
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "orderStatus" SET DEFAULT 'PENDING',
ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PaymentMethod" ALTER COLUMN "fee" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileImage" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "phoneNumber" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(10,8),
ALTER COLUMN "longitude" SET DATA TYPE DECIMAL(11,8);

-- DropTable
DROP TABLE "Transanction";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" VARCHAR(30) NOT NULL,
    "userId" VARCHAR(30) NOT NULL,
    "paymentMethodId" VARCHAR(30) NOT NULL,
    "orderId" VARCHAR(30) NOT NULL,
    "adminFee" DECIMAL(5,2) NOT NULL,
    "paymentMethodFee" DECIMAL(5,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
