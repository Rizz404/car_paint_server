import { register, login } from "@/controller/auth-controller";
import { validateBody } from "@/middlewares/validate-request";
import { loginSchema, registerSchema } from "@/validation/auth-validation";
import express from "express";

const authRouter = express.Router();

authRouter.route("/register").post(validateBody(registerSchema), register);
authRouter.route("/login").post(validateBody(loginSchema), login);

export default authRouter;
