import express from "express";
import carCarBrandRouter from "./routes/car-brand-routes";
import authRouter from "./routes/auth-routes";
import profileRouter from "./routes/profile-routes";
import workshopRouter from "./routes/workshop-routes";
import carsRouter from "./routes/cars-routes";
import userRouter from "./routes/user-routes";

const routes = express.Router();

routes.use("/car-brands", carCarBrandRouter);
routes.use("/workshops", workshopRouter);
routes.use("/auth", authRouter);
routes.use("/users", userRouter);
routes.use("/profile", profileRouter);
routes.use("/user-cars", carsRouter);

export default routes;
