import prisma from "@/configs/database";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import env from "@/configs/environtment";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const emailExist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (emailExist) {
      return createErrorResponse(res, "Email already registered", 400);
    }
    const usernameExist = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (usernameExist) {
      return createErrorResponse(res, "Username already registered", 400);
    }

    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profileImage: faker.image.avatar(),
        userProfile: { create: {} },
      },
    });

    return createSuccessResponse(res, createdUser, "User created", 201);
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { username, email, password }: User = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      include: { userProfile: true },
    });

    if (!user) return createErrorResponse(res, "Credentials not match", 400);

    const passwordMatch = await bcrypt.compare(password, user.password!);

    if (!passwordMatch) {
      return createErrorResponse(res, "Password not match", 400);
    }

    const newAccessToken = jwt.sign(
      { userId: user.id },
      env.JWT_ACCESS_TOKEN!,
      {
        expiresIn: "30d",
      }
    );

    return createSuccessResponse(
      res,
      { ...user, newAccessToken },
      "User logged in"
    );
  } catch (error) {
    return createErrorResponse(res, error, 500);
  }
};
