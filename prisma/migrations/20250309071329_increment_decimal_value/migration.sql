-- AlterTable
ALTER TABLE "car_services" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "subtotal_price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payment_methods" ALTER COLUMN "fee" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "maximum_payment" SET DEFAULT 100000000,
ALTER COLUMN "maximum_payment" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "minimum_payment" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "refunds" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "admin_fee" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total_price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "user_profiles" ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(12,8);
