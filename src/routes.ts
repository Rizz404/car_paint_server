import express from "express";
import brandRouter from "./routes/brand-routes";
import authRouter from "./routes/auth-routes";
import profileRouter from "./routes/profile-routes";
import workshopRouter from "./routes/workshop-routes";

const routes = express.Router();

routes.use("/brands", brandRouter);
routes.use("/workshops", workshopRouter);
routes.use("/auth", authRouter);
routes.use("/profile", profileRouter);

export default routes;
