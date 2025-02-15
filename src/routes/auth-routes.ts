import { register, login } from "@/controller/auth-controller";
import { validateRequest } from "@/middlewares/validate-request";
import { loginSchema, registerSchema } from "@/validation/auth-validation";
import express from "express";

const authRouter = express.Router();

authRouter.route("/register").post(validateRequest(registerSchema), register);
authRouter.route("/login").post(validateRequest(loginSchema), login);

export default authRouter;
