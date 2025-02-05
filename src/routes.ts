import express from "express";
import brandRouter from "./routes/brand-routes";

const routes = express.Router();

routes.use("/brands", brandRouter);

export default routes;
