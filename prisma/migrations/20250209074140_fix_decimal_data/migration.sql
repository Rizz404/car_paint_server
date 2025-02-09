-- AlterTable
ALTER TABLE "payment_methods" ALTER COLUMN "fee" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "admin_fee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "payment_method_fee" SET DATA TYPE DECIMAL(10,2);
