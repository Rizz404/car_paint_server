import express from "express";
import carBrandRouter from "./routes/car-brand-routes";
import authRouter from "./routes/auth-routes";
import profileRouter from "./routes/profile-routes";
import workshopRouter from "./routes/workshop-routes";
import carsRouter from "./routes/user-car-routes";
import userRouter from "./routes/user-routes";
import carModelRouter from "./routes/car-model-routes";
import carServiceRouter from "./routes/car-service-routes";
import carModelColorRouter from "./routes/car-model-color-routes";
import carModelYearRouter from "./routes/car-model-year-routes";
import paymentMethodRouter from "./routes/payment-method-routes";
import orderRouter from "./routes/order-routes";
import transactionRouter from "./routes/transaction-routes";
import eTicketRouter from "./routes/e-ticket-routes";

const routes = express.Router();

routes.use("/auth", authRouter);
routes.use("/users", userRouter);
routes.use("/car-brands", carBrandRouter);
routes.use("/car-models", carModelRouter);
routes.use("/car-services", carServiceRouter);
routes.use("/car-model-colors", carModelColorRouter);
routes.use("/car-model-years", carModelYearRouter);
routes.use("/user-cars", carsRouter);
routes.use("/workshops", workshopRouter);
routes.use("/payment-methods", paymentMethodRouter);
routes.use("/orders", orderRouter);
routes.use("/transactions", transactionRouter);
routes.use("/e-tickets", eTicketRouter);

routes.use("/profile", profileRouter);

export default routes;
