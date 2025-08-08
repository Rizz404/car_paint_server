-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_car_model_color_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "car_colors" TEXT[],
ALTER COLUMN "car_model_color_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_car_model_color_id_fkey" FOREIGN KEY ("car_model_color_id") REFERENCES "car_model_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
