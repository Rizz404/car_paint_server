-- DropForeignKey
ALTER TABLE "car_model_year_colors" DROP CONSTRAINT "car_model_year_colors_car_model_year_id_fkey";

-- DropForeignKey
ALTER TABLE "car_model_year_colors" DROP CONSTRAINT "car_model_year_colors_color_id_fkey";

-- DropForeignKey
ALTER TABLE "user_cars" DROP CONSTRAINT "user_cars_car_model_year_color_id_fkey";

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_car_model_year_id_fkey" FOREIGN KEY ("car_model_year_id") REFERENCES "car_model_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_car_model_year_color_id_fkey" FOREIGN KEY ("car_model_year_color_id") REFERENCES "car_model_year_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
