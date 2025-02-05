import { register, login } from "@/controller/auth-controller";
import { validateBody } from "@/middlewares/validate-body";
import { loginSchema, registerSchema } from "@/validation/auth-validation";
import express from "express";

const authRouter = express.Router();

authRouter.route("/register").post(validateBody(createBrandSchema), register);
authRouter.route("/login").post(validateBody(createBrandSchema), login);

export default authRouter;
