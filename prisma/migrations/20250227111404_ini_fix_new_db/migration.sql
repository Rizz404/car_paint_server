-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('QUEUED', 'INSPECTION', 'PUTTY', 'SURFACER', 'APPLICATION_COLOR_BASE', 'APPLICATION_CLEAR_COAT', 'POLISHING', 'FINAL_QC', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'EXPIRED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('CARD', 'DIRECT_DEBIT', 'EWALLET', 'OVER_THE_COUNTER', 'QR_CODE', 'VIRTUAL_ACCOUNT', 'UNKNOWN_ENUM_VALUE');

-- CreateEnum
CREATE TYPE "PaymentReusability" AS ENUM ('ONE_TIME_USE', 'MULTIPLE_USE');

-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('CUSTOMER_REQUEST', 'WORKSHOP_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'SCHEDULING_CONFLICT', 'PAYMENT_ISSUE', 'VEHICLE_ISSUE', 'PRICE_DISAGREEMENT', 'WORKSHOP_OVERBOOKED', 'DUPLICATE_ORDER', 'PARTS_UNAVAILABLE', 'CUSTOMER_NO_SHOW', 'FORCE_MAJEURE', 'SERVICE_INCOMPATIBILITY', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(30) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
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
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "car_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "PaymentMethodType" NOT NULL DEFAULT 'EWALLET',
    "reusability" "PaymentReusability" NOT NULL DEFAULT 'ONE_TIME_USE',
    "fee" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "channel_code" VARCHAR(50),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ewallet_payment_configs" (
    "id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "channel_code" VARCHAR(50) NOT NULL,
    "success_return_url" TEXT,
    "failure_return_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ewallet_payment_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_account_configs" (
    "id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "bank_code" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "account_pattern" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_account_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "user_car_id" VARCHAR(30) NOT NULL,
    "workshop_id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "work_status" "WorkStatus" NOT NULL DEFAULT 'QUEUED',
    "order_status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "note" TEXT,
    "subtotal_price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(30) NOT NULL,
    "user_id" VARCHAR(30) NOT NULL,
    "payment_method_id" VARCHAR(30) NOT NULL,
    "invoice_id" VARCHAR(30),
    "admin_fee" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "payment_method_fee" DECIMAL(10,2) NOT NULL,
    "payment_invoice_url" TEXT,
    "mobile_url" TEXT,
    "web_url" TEXT,
    "refund_amount" DECIMAL(10,2),
    "refunded_at" TIMESTAMP(3),
    "cancellation_reason" "CancellationReason",
    "cancellation_notes" TEXT,
    "cancelled_by" VARCHAR(30),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_details" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "virtual_account_number" TEXT,
    "invoice_url" TEXT,
    "mobile_url" TEXT,
    "web_url" TEXT,
    "deeplink_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "xendit_payment_method_id" TEXT,
    "xendit_payment_request_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellations" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "reason" "CancellationReason" NOT NULL,
    "notes" TEXT,
    "cancelled_by_id" VARCHAR(30) NOT NULL,
    "cancelled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" VARCHAR(30) NOT NULL,
    "transaction_id" VARCHAR(30) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "refunded_by_id" VARCHAR(30) NOT NULL,
    "refunded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "payment_methods_name_key" ON "payment_methods"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ewallet_payment_configs_payment_method_id_key" ON "ewallet_payment_configs"("payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_account_configs_payment_method_id_key" ON "virtual_account_configs"("payment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_details_transaction_id_key" ON "payment_details"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "cancellations_transaction_id_key" ON "cancellations"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_transaction_id_key" ON "refunds"("transaction_id");

-- CreateIndex
CREATE INDEX "_CarServiceToOrder_B_index" ON "_CarServiceToOrder"("B");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_car_brand_id_fkey" FOREIGN KEY ("car_brand_id") REFERENCES "car_brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_years" ADD CONSTRAINT "car_model_years_car_model_id_fkey" FOREIGN KEY ("car_model_id") REFERENCES "car_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_car_model_year_id_fkey" FOREIGN KEY ("car_model_year_id") REFERENCES "car_model_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "car_model_year_colors" ADD CONSTRAINT "car_model_year_colors_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_car_model_year_color_id_fkey" FOREIGN KEY ("car_model_year_color_id") REFERENCES "car_model_year_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ewallet_payment_configs" ADD CONSTRAINT "ewallet_payment_configs_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_account_configs" ADD CONSTRAINT "virtual_account_configs_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_car_id_fkey" FOREIGN KEY ("user_car_id") REFERENCES "user_cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_workshop_id_fkey" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_details" ADD CONSTRAINT "payment_details_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellations" ADD CONSTRAINT "cancellations_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_refunded_by_id_fkey" FOREIGN KEY ("refunded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_tickets" ADD CONSTRAINT "e_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_tickets" ADD CONSTRAINT "e_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarServiceToOrder" ADD CONSTRAINT "_CarServiceToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "car_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarServiceToOrder" ADD CONSTRAINT "_CarServiceToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
