import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        UserProfile: { create: {} },
      },
    });

    createSuccessResponse(res, createdUser, "User created", 201);
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: User = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      include: { UserProfile: true },
    });

    if (!user) return createErrorResponse(res, "Credentials not match", 400);

    const passwordMatch = await bcrypt.compare(password!, user.password!);

    if (!passwordMatch) {
      return createErrorResponse(res, "Password not match", 400);
    }

    const newAccessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_ACCESS_TOKEN!,
      {
        expiresIn: "30d",
      }
    );

    createSuccessResponse(res, { ...user, newAccessToken }, "User logged in");
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
