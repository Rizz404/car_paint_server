/*
  Warnings:

  - You are about to drop the column `user_car_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `user_cars` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `car_model_year_color_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_car_id_fkey";

-- DropForeignKey
ALTER TABLE "user_cars" DROP CONSTRAINT "user_cars_car_model_year_color_id_fkey";

-- DropForeignKey
ALTER TABLE "user_cars" DROP CONSTRAINT "user_cars_user_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "user_car_id",
ADD COLUMN     "car_model_year_color_id" VARCHAR(30) NOT NULL;

-- DropTable
DROP TABLE "user_cars";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_car_model_year_color_id_fkey" FOREIGN KEY ("car_model_year_color_id") REFERENCES "car_model_year_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
