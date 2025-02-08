-- AlterTable
ALTER TABLE "car_services" ALTER COLUMN "price" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "work_status" DROP NOT NULL;
