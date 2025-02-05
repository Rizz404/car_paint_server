import prisma from "@/configs/database";
import {
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
} from "@/types/api-response";
import { RequestHandler } from "express";
import bcrypt from "bcrypt";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // const createdUser = await prisma.user
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
  } catch (error) {
    createErrorResponse(res, error, 500);
  }
};
