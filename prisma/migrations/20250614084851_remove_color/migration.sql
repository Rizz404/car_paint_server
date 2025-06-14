/*
  Warnings:

  - You are about to drop the column `car_model_year_color_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the `car_model_year_colors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `car_model_years` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `car_model_color_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "car_model_year_colors" DROP CONSTRAINT "car_model_year_colors_car_model_year_id_fkey";

-- DropForeignKey
ALTER TABLE "car_model_year_colors" DROP CONSTRAINT "car_model_year_colors_color_id_fkey";

-- DropForeignKey
ALTER TABLE "car_model_years" DROP CONSTRAINT "car_model_years_car_model_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_car_model_year_color_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "car_model_year_color_id",
ADD COLUMN     "car_model_color_id" VARCHAR(30) NOT NULL;

-- DropTable
DROP TABLE "car_model_year_colors";

-- DropTable
DROP TABLE "car_model_years";

-- CreateTable
CREATE TABLE "car_model_colors" (
    "id" VARCHAR(30) NOT NULL,
    "car_model_id" VARCHAR(30) NOT NULL,
    "color_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_model_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "car_model_colors_car_model_id_color_id_key" ON "car_model_colors"("car_model_id", "color_id");

-- AddForeignKey
ALTER TABLE "car_model_colors" ADD CONSTRAINT "car_model_colors_car_model_id_fkey" FOREIGN KEY ("car_model_id") REFERENCES "car_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_colors" ADD CONSTRAINT "car_model_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_car_model_color_id_fkey" FOREIGN KEY ("car_model_color_id") REFERENCES "car_model_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
