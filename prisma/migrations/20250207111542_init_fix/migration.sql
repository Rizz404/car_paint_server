-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('INSPECTION', 'PUTTY', 'SURFACER', 'APPLICATION_COLOR_BASE', 'APPLICATION_CLEAR_COAT', 'POLISHING', 'FINALQC', 'DONE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(30) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "fullname" VARCHAR(255),
    "phone_number" VARCHAR(20),
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_brands" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "logo" TEXT NOT NULL,
    "country" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_models" (
    "id" VARCHAR(30) NOT NULL,
    "car_brand_id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_model_years" (
    "id" VARCHAR(30) NOT NULL,
    "car_model_id" VARCHAR(30) NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_model_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_model_year_colors" (
    "id" TEXT NOT NULL,
    "car_model_year_id" VARCHAR(30) NOT NULL,
    "color_id" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_model_year_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_cars" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "car_model_year_color_id" VARCHAR(30) NOT NULL,
    "license_plate" VARCHAR(50) NOT NULL,
    "car_images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_cars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(15),
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_services" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "fee" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "user_car_id" VARCHAR(30) NOT NULL,
    "workshop_id" VARCHAR(30) NOT NULL,
    "work_status" "WorkStatus" NOT NULL,
    "order_status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "admin_fee" DECIMAL(5,2) NOT NULL,
    "payment_method_fee" DECIMAL(5,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_tickets" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "order_id" VARCHAR(30) NOT NULL,
    "ticket_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarServiceToOrder" (
    "A" VARCHAR(30) NOT NULL,
    "B" VARCHAR(30) NOT NULL,

    CONSTRAINT "_CarServiceToOrder_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "car_brands_name_key" ON "car_brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "car_models_name_car_brand_id_key" ON "car_models"("name", "car_brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "car_model_years_year_car_model_id_key" ON "car_model_years"("year", "car_model_id");

-- CreateIndex
CREATE UNIQUE INDEX "colors_name_key" ON "colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "car_model_year_colors_car_model_year_id_color_id_key" ON "car_model_year_colors"("car_model_year_id", "color_id");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_name_key" ON "workshops"("name");

-- CreateIndex
CREATE UNIQUE INDEX "car_services_name_key" ON "car_services"("name");

-- CreateIndex
CREATE INDEX "_CarServiceToOrder_B_index" ON "_CarServiceToOrder"("B");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_car_brand_id_fkey" FOREIGN KEY ("car_brand_id") REFERENCES "car_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_years" ADD CONSTRAINT "car_model_years_car_model_id_fkey" FOREIGN KEY ("car_model_id") REFERENCES "car_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_car_model_year_id_fkey" FOREIGN KEY ("car_model_year_id") REFERENCES "car_model_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_car_model_year_color_id_fkey" FOREIGN KEY ("car_model_year_color_id") REFERENCES "car_model_year_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_car_id_fkey" FOREIGN KEY ("user_car_id") REFERENCES "user_cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_tickets" ADD CONSTRAINT "e_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_tickets" ADD CONSTRAINT "e_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarServiceToOrder" ADD CONSTRAINT "_CarServiceToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "car_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarServiceToOrder" ADD CONSTRAINT "_CarServiceToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
